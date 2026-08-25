import React, { forwardRef, useState, useRef, useEffect } from 'react'
import SlideBackground, { getBackgroundPreset } from '../../../shared/components/SlideBackground'
import SlideElement from './SlideElement'

const SlideCanvas = forwardRef(({
  elements = [],
  slideConfig = {},
  trackColor = { primary: '#1E5FA8', accent: '#A9D0F5' },
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onMoveElement,
  onDuplicateElement,
  onRemoveElement,
  zoom = 1.0,
  showGrid = false,
  gridSize = 10,
}, ref) => {
  const [dragState, setDragState] = useState(null)
  const [guideLines, setGuideLines] = useState({ vertical: null, horizontal: null })
  const innerCanvasRef = useRef(null)

  const width = slideConfig.width || 540
  const height = slideConfig.height || 675
  const padding = slideConfig.padding || 32

  const handleMouseDown = (e, elementId) => {
    if (elementId) {
      e.stopPropagation()
      onSelectElement(elementId)

      const element = elements.find((el) => el.id === elementId)
      if (!element) return

      setDragState({
        elementId,
        startX: e.clientX,
        startY: e.clientY,
        initialX: element.x || 0,
        initialY: element.y || 0,
        elementWidth: element.width || 100,
        elementHeight: element.height || 60,
      })
    } else {
      onSelectElement(null)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragState) return

      const scale = zoom || 1.0
      const deltaX = (e.clientX - dragState.startX) / scale
      const deltaY = (e.clientY - dragState.startY) / scale

      let newX = Math.round(dragState.initialX + deltaX)
      let newY = Math.round(dragState.initialY + deltaY)

      // Smart alignment snapping (artboard center x=270, y=337.5)
      const elementCenterX = newX + dragState.elementWidth / 2
      const elementCenterY = newY + dragState.elementHeight / 2
      const artboardCenterX = width / 2
      const artboardCenterY = height / 2

      const snapThreshold = 6
      let snappedVertical = null
      let snappedHorizontal = null

      if (Math.abs(elementCenterX - artboardCenterX) < snapThreshold) {
        newX = Math.round(artboardCenterX - dragState.elementWidth / 2)
        snappedVertical = artboardCenterX
      }

      if (Math.abs(elementCenterY - artboardCenterY) < snapThreshold) {
        newY = Math.round(artboardCenterY - dragState.elementHeight / 2)
        snappedHorizontal = artboardCenterY
      }

      // Grid snapping (skipped on the axis where center-snap already applied)
      if (showGrid) {
        if (snappedVertical === null) newX = Math.round(newX / gridSize) * gridSize
        if (snappedHorizontal === null) newY = Math.round(newY / gridSize) * gridSize
      }

      setGuideLines({
        vertical: snappedVertical,
        horizontal: snappedHorizontal,
      })

      onMoveElement(dragState.elementId, newX, newY)
    }

    const handleMouseUp = () => {
      setDragState(null)
      setGuideLines({ vertical: null, horizontal: null })
    }

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, zoom, width, height, onMoveElement, showGrid, gridSize])

  const bgConfig = getBackgroundPreset(slideConfig.backgroundType || 'dots', trackColor)

  return (
    <div
      ref={(node) => {
        innerCanvasRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      id="slide-builder-canvas"
      className="relative rounded-2xl shadow-2xl overflow-hidden select-none isolate border border-white/10"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: slideConfig.background || '#FFFFFF',
        fontFamily: 'Georgia, serif',
      }}
      onMouseDown={(e) => handleMouseDown(e, null)}
    >
      {/* Background Layer with preset patterns */}
      <SlideBackground config={bgConfig} seed={1} />

      {/* Grid Snapping Overlay */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(6,182,212,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(6,182,212,0.14) 1px, transparent 1px)',
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}

      {/* Fixed Non-Draggable Header */}
      {slideConfig.header?.show && (
        <div
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{ padding: `${padding}px ${padding}px 0 ${padding}px` }}
        >
          <div className="flex items-center justify-between gap-3">
            <span
              style={{
                fontFamily:
                  slideConfig.header.font?.family === 'monospace'
                    ? '"Courier New", Courier, monospace'
                    : 'monospace',
                fontSize: `${slideConfig.header.font?.size || 12}px`,
                fontWeight: slideConfig.header.font?.weight || 'bold',
                color: slideConfig.header.font?.color || trackColor.primary,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
              }}
            >
              {slideConfig.header.text || 'TRACK 01'}
            </span>
            <div
              className="flex-1 h-[2px] rounded-full"
              style={{
                backgroundColor: trackColor.accent,
                opacity: 0.85,
              }}
            />
          </div>
        </div>
      )}

      {/* Interactive Alignment Guides (Active during dragging only) */}
      {guideLines.vertical !== null && (
        <div
          className="absolute top-0 bottom-0 z-40 pointer-events-none border-l-2 border-dashed border-cyan-400"
          style={{ left: `${guideLines.vertical}px` }}
        />
      )}
      {guideLines.horizontal !== null && (
        <div
          className="absolute left-0 right-0 z-40 pointer-events-none border-t-2 border-dashed border-cyan-400"
          style={{ top: `${guideLines.horizontal}px` }}
        />
      )}

      {/* Draggable & Resizable Slide Elements */}
      {elements.map((element) => (
        <SlideElement
          key={element.id}
          element={element}
          isSelected={element.id === selectedElementId}
          onSelect={() => onSelectElement(element.id)}
          onUpdate={(updates) => onUpdateElement(element.id, updates)}
          onDuplicate={() => onDuplicateElement(element.id)}
          onRemove={() => onRemoveElement(element.id)}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
          trackColor={trackColor}
          slideConfig={slideConfig}
          zoom={zoom}
          showGrid={showGrid}
          gridSize={gridSize}
        />
      ))}

      {/* Fixed Non-Draggable Footer */}
      {slideConfig.footer?.show && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
          style={{ padding: `0 ${padding}px ${padding}px ${padding}px` }}
        >
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <span
              style={{
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: `${slideConfig.footer.font?.size || 11}px`,
                color: slideConfig.footer.font?.color || '#64748b',
                fontWeight: 'bold',
              }}
            >
              {slideConfig.footer.showSlideNumber &&
                `${slideConfig.currentSlideNo || 1} / ${slideConfig.totalSlides || 7}`}
            </span>
            {slideConfig.footer.showSwipe && (
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '12px',
                  color: '#0f172a',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Swipe ➔
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

export default SlideCanvas
