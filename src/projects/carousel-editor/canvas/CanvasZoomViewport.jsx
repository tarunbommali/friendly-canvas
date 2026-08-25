import React, { useRef, useState, useEffect } from 'react'
import { Hand } from 'lucide-react'
import { useCanvasViewport } from './useCanvasViewport'
import Rulers from './Rulers'

export default function CanvasZoomViewport({
  children,
  canvasWidth = 1080,
  canvasHeight = 1350,
  slideKey,
  className = '',
  onDeselect,
}) {
  const containerRef = useRef(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const showGrid = false
  const gridSize = 10

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const {
    zoom,
    pan,
    isSpacePressed,
    isPanning,
    handleWheel,
    startPan,
  } = useCanvasViewport({
    artboardWidth: canvasWidth,
    artboardHeight: canvasHeight,
    containerRef,
    onSlideChangeKey: slideKey,
  })

  const getCursorClass = () => {
    if (isPanning) return 'cursor-grabbing'
    if (isSpacePressed) return 'cursor-grab'
    return 'cursor-default'
  }

  const handleContainerMouseDown = (e) => {
    if (e.button === 1 || isSpacePressed || e.target === containerRef.current || e.target.classList.contains('viewport-bg')) {
      e.preventDefault()
      startPan(e.clientX, e.clientY)
      if (onDeselect && !isSpacePressed) onDeselect()
    }
  }

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleContainerMouseDown}
      className={`viewport-bg relative w-full h-full overflow-hidden bg-[#0b0d13] select-none ${getCursorClass()} ${className}`}
      style={{
        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.07) 1.2px, transparent 1.2px)`,
        backgroundSize: `${Math.max(12, 24 * zoom)}px ${Math.max(12, 24 * zoom)}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      <Rulers zoom={zoom} pan={pan} canvasWidth={canvasWidth} canvasHeight={canvasHeight} containerSize={containerSize} />

      {isSpacePressed && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1 bg-cyan-500/90 text-slate-950 font-bold text-xs rounded-full shadow-lg flex items-center gap-1.5 pointer-events-none animate-fade-in">
          <Hand className="w-3.5 h-3.5" /> Space + Drag to Pan
        </div>
      )}

      {/* Artboard Container positioned via pan.x/pan.y and zoom scale */}
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '0 0',
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        {React.isValidElement(children)
          ? React.cloneElement(children, { zoom, showGrid, gridSize })
          : children}
      </div>
    </div>
  )
}
