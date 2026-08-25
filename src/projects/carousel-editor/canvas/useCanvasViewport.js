/**
 * useCanvasViewport.js
 * ────────────────────
 * Manages viewport zoom and pan state independently from slide content.
 * Provides Canva-style fixed artboard auto-centering, wheel zoom, and pan navigation.
 */

import { useState, useCallback, useEffect, useRef } from 'react'

export const ZOOM_STEPS = [0.25, 0.33, 0.5, 0.67, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0, 4.0]
const MIN_ZOOM = 0.2
const MAX_ZOOM = 4.0

export function useCanvasViewport({
  artboardWidth = 1080,
  artboardHeight = 1350,
  containerRef,
  onSlideChangeKey,
}) {
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isFitMode, setIsFitMode] = useState(true)
  const [isSpacePressed, setIsSpacePressed] = useState(false)
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ startX: 0, startY: 0, initialPanX: 0, initialPanY: 0 })

  /**
   * Computes the scale and centered pan required to fit the artboard inside the container.
   */
  const computeFit = useCallback(() => {
    const container = containerRef?.current
    if (!container) return { zoom: 1.0, panX: 0, panY: 0 }

    const rect = container.getBoundingClientRect()
    const containerWidth = container.clientWidth || rect.width
    const containerHeight = container.clientHeight || rect.height

    if (!containerWidth || !containerHeight) {
      return { zoom: 1.0, panX: 0, panY: 0 }
    }

    const padding = 48
    const availableWidth = Math.max(100, containerWidth - padding)
    const availableHeight = Math.max(100, containerHeight - padding)

    const scaleX = availableWidth / artboardWidth
    const scaleY = availableHeight / artboardHeight
    const fitScale = Math.min(scaleX, scaleY)
    const clampedFit = Math.max(MIN_ZOOM, Math.min(1.5, fitScale))

    const centeredPanX = (containerWidth - artboardWidth * clampedFit) / 2
    const centeredPanY = (containerHeight - artboardHeight * clampedFit) / 2

    return {
      zoom: clampedFit,
      panX: centeredPanX,
      panY: centeredPanY,
    }
  }, [artboardWidth, artboardHeight, containerRef])

  /**
   * Trigger Fit to Viewport
   */
  const fitToScreen = useCallback(() => {
    const { zoom: fitZoom, panX, panY } = computeFit()
    setZoom(fitZoom)
    setPan({ x: panX, y: panY })
    setIsFitMode(true)
  }, [computeFit])

  /**
   * Set 100% (1:1) Zoom centered
   */
  const setActualSize = useCallback(() => {
    const container = containerRef?.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const containerWidth = container.clientWidth || rect.width || 800
    const containerHeight = container.clientHeight || rect.height || 700

    const centeredPanX = (containerWidth - artboardWidth) / 2
    const centeredPanY = (containerHeight - artboardHeight) / 2

    setZoom(1.0)
    setPan({ x: centeredPanX, y: centeredPanY })
    setIsFitMode(false)
  }, [artboardWidth, artboardHeight, containerRef])

  /**
   * Zoom centered at a specific container client coordinate (e.g. cursor location)
   */
  const zoomAtPoint = useCallback((newZoomCandidate, cursorX, cursorY) => {
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomCandidate))

    setZoom((prevZoom) => {
      setPan((prevPan) => {
        const artboardX = (cursorX - prevPan.x) / prevZoom
        const artboardY = (cursorY - prevPan.y) / prevZoom

        const newPanX = cursorX - artboardX * clampedZoom
        const newPanY = cursorY - artboardY * clampedZoom

        return { x: newPanX, y: newPanY }
      })
      return clampedZoom
    })
    setIsFitMode(false)
  }, [])

  /**
   * Step Zoom In / Out
   */
  const zoomIn = useCallback(() => {
    const container = containerRef?.current
    const cursorX = container ? container.clientWidth / 2 : 400
    const cursorY = container ? container.clientHeight / 2 : 350
    const nextStep = ZOOM_STEPS.find((s) => s > zoom + 0.02) || Math.min(MAX_ZOOM, zoom * 1.25)
    zoomAtPoint(nextStep, cursorX, cursorY)
  }, [zoom, containerRef, zoomAtPoint])

  const zoomOut = useCallback(() => {
    const container = containerRef?.current
    const cursorX = container ? container.clientWidth / 2 : 400
    const cursorY = container ? container.clientHeight / 2 : 350
    const prevSteps = ZOOM_STEPS.filter((s) => s < zoom - 0.02)
    const prevStep = prevSteps.length > 0 ? prevSteps[prevSteps.length - 1] : Math.max(MIN_ZOOM, zoom * 0.8)
    zoomAtPoint(prevStep, cursorX, cursorY)
  }, [zoom, containerRef, zoomAtPoint])

  /**
   * Auto-fit on initial mount & container resize
   */
  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    const handleResize = () => {
      fitToScreen()
    }

    const rafId = requestAnimationFrame(handleResize)
    const observer = new ResizeObserver(() => {
      handleResize()
    })
    observer.observe(container)

    return () => {
      cancelAnimationFrame(rafId)
      observer.disconnect()
    }
  }, [containerRef, fitToScreen])

  /**
   * Auto-fit when switching slides
   */
  useEffect(() => {
    fitToScreen()
  }, [onSlideChangeKey, fitToScreen])

  /**
   * Global Space key listener & keyboard shortcuts
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable
      if (isInput) return

      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true)
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '0' || e.key === 'Digit0')) {
        e.preventDefault()
        fitToScreen()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '1' || e.key === 'Digit1')) {
        e.preventDefault()
        setActualSize()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        zoomIn()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault()
        zoomOut()
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [fitToScreen, setActualSize, zoomIn, zoomOut])

  /**
   * Mouse Wheel: Pinch/Ctrl-Wheel to Zoom; Trackpad/Wheel to Pan
   */
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const container = containerRef?.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const cursorX = e.clientX - rect.left
    const cursorY = e.clientY - rect.top

    if (e.ctrlKey || e.metaKey) {
      const zoomFactor = 1 - e.deltaY * 0.005
      const candidateZoom = zoom * zoomFactor
      zoomAtPoint(candidateZoom, cursorX, cursorY)
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }))
      setIsFitMode(false)
    }
  }, [containerRef, zoom, zoomAtPoint])

  /**
   * Pan Dragging with Middle Click or Space + Drag
   */
  const startPan = useCallback((clientX, clientY) => {
    setIsPanning(true)
    setIsFitMode(false)
    panStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialPanX: pan.x,
      initialPanY: pan.y,
    }

    const handleMouseMove = (e) => {
      const deltaX = e.clientX - panStartRef.current.startX
      const deltaY = e.clientY - panStartRef.current.startY
      setPan({
        x: panStartRef.current.initialPanX + deltaX,
        y: panStartRef.current.initialPanY + deltaY,
      })
    }

    const handleMouseUp = () => {
      setIsPanning(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [pan.x, pan.y])

  return {
    zoom,
    pan,
    isFitMode,
    isSpacePressed,
    isPanning,
    fitToScreen,
    setActualSize,
    zoomIn,
    zoomOut,
    zoomAtPoint,
    handleWheel,
    startPan,
  }
}
