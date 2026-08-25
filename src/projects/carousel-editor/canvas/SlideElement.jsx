import React, { useState, useRef, useEffect } from 'react'
import {
  Zap,
  Star,
  Heart,
  Check,
  X,
  ArrowRight,
  Settings,
  Rocket,
  BookOpen,
  Laptop,
  Bot,
  Database,
  Shield,
  Terminal,
  Globe,
  Sparkles,
  Copy,
  Trash2,
} from 'lucide-react'

const ICON_MAP = {
  lightning: Zap,
  star: Star,
  heart: Heart,
  check: Check,
  cross: X,
  arrow: ArrowRight,
  gear: Settings,
  rocket: Rocket,
  book: BookOpen,
  computer: Laptop,
  ai: Bot,
  database: Database,
  shield: Shield,
  terminal: Terminal,
  network: Globe,
  sparkles: Sparkles,
}

const RESIZE_HANDLES = [
  { id: 'nw', cursor: 'nwse-resize', left: '0%', top: '0%' },
  { id: 'n', cursor: 'ns-resize', left: '50%', top: '0%' },
  { id: 'ne', cursor: 'nesw-resize', left: '100%', top: '0%' },
  { id: 'e', cursor: 'ew-resize', left: '100%', top: '50%' },
  { id: 'se', cursor: 'nwse-resize', left: '100%', top: '100%' },
  { id: 's', cursor: 'ns-resize', left: '50%', top: '100%' },
  { id: 'sw', cursor: 'nesw-resize', left: '0%', top: '100%' },
  { id: 'w', cursor: 'ew-resize', left: '0%', top: '50%' },
]

export default function SlideElement({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDuplicate,
  onRemove,
  onMouseDown,
  trackColor = { primary: '#1E5FA8', accent: '#A9D0F5' },
  slideConfig,
  zoom = 1.0,
  showGrid = false,
  gridSize = 10,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [resizeState, setResizeState] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = (e) => {
    e.stopPropagation()
    if (element.type === 'text' || element.type === 'badge' || element.type === 'headline') {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && element.type !== 'text') {
      e.preventDefault()
      setIsEditing(false)
    }
    if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  // Start Resizing from a handle
  const handleResizeMouseDown = (e, handleId) => {
    e.stopPropagation()
    setResizeState({
      handle: handleId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: element.x || 0,
      initialY: element.y || 0,
      initialWidth: element.width || 100,
      initialHeight: element.height || 60,
    })
  }

  // Handle Resize Move & Up
  useEffect(() => {
    if (!resizeState) return

    const handleMouseMove = (e) => {
      const scaleFactor = zoom || 1.0
      const deltaX = (e.clientX - resizeState.startX) / scaleFactor
      const deltaY = (e.clientY - resizeState.startY) / scaleFactor

      const minWidth = 24
      const minHeight = 24

      let newX = resizeState.initialX
      let newY = resizeState.initialY
      let newWidth = resizeState.initialWidth
      let newHeight = resizeState.initialHeight

      const { handle } = resizeState

      // Horizontal resizing
      if (handle.includes('e')) {
        newWidth = Math.max(minWidth, Math.round(resizeState.initialWidth + deltaX))
      } else if (handle.includes('w')) {
        const potentialWidth = resizeState.initialWidth - deltaX
        if (potentialWidth >= minWidth) {
          newWidth = Math.round(potentialWidth)
          newX = Math.round(resizeState.initialX + deltaX)
        }
      }

      // Vertical resizing
      if (handle.includes('s')) {
        newHeight = Math.max(minHeight, Math.round(resizeState.initialHeight + deltaY))
      } else if (handle.includes('n')) {
        const potentialHeight = resizeState.initialHeight - deltaY
        if (potentialHeight >= minHeight) {
          newHeight = Math.round(potentialHeight)
          newY = Math.round(resizeState.initialY + deltaY)
        }
      }

      if (showGrid) {
        newX = Math.round(newX / gridSize) * gridSize
        newY = Math.round(newY / gridSize) * gridSize
        newWidth = Math.max(minWidth, Math.round(newWidth / gridSize) * gridSize)
        newHeight = Math.max(minHeight, Math.round(newHeight / gridSize) * gridSize)
      }

      onUpdate({
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      })
    }

    const handleMouseUp = () => {
      setResizeState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizeState, zoom, onUpdate, showGrid, gridSize])

  const baseStyle = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
    zIndex: element.zIndex || 1,
    cursor: isEditing ? 'text' : resizeState ? 'crosshair' : 'move',
    userSelect: isEditing ? 'auto' : 'none',
  }

  const renderContent = () => {
    switch (element.type) {
      case 'headline': {
        const font = element.font || { family: 'Georgia', size: 32, weight: 'bold', color: '#0f172a' }
        const highlightBg = element.style?.backgroundColor || element.highlightColor || trackColor.accent || '#A9D0F5'
        return (
          <div
            className="w-full h-full flex items-center"
            style={{
              justifyContent:
                element.align === 'center'
                  ? 'center'
                  : element.align === 'right'
                  ? 'flex-end'
                  : 'flex-start',
              textAlign: element.align || 'left',
            }}
          >
            {isEditing ? (
              <textarea
                ref={inputRef}
                className="w-full h-full bg-white/95 text-slate-900 border border-cyan-500 rounded p-2 outline-none resize-none shadow-md font-serif font-bold"
                style={{
                  fontSize: `${Math.min(font.size, 32)}px`,
                  fontWeight: font.weight,
                  color: font.color,
                  textAlign: element.align || 'left',
                }}
                value={element.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <div
                className="inline-block w-full"
                style={{
                  backgroundColor: highlightBg,
                  padding: element.style?.padding || '6px 14px',
                  borderRadius: element.style?.borderRadius || '8px',
                  fontFamily: font.family === 'Georgia' ? 'Georgia, serif' : font.family,
                  fontSize: `${font.size}px`,
                  fontWeight: font.weight || 'bold',
                  color: font.color || '#0f172a',
                  lineHeight: '1.25',
                  wordBreak: 'break-word',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                {element.content}
              </div>
            )}
          </div>
        )
      }

      case 'container':
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.fill || element.style?.backgroundColor || '#ffffff',
              borderRadius: `${element.borderRadius || element.style?.borderRadius || 12}px`,
              border: element.stroke ? `${element.strokeWidth || 1}px solid ${element.stroke}` : (element.style?.border || '1px solid rgba(0,0,0,0.08)'),
              borderLeft: element.style?.borderLeft || (element.stroke ? `4px solid ${element.stroke}` : undefined),
              boxShadow: element.style?.boxShadow || '0 1px 3px rgba(0,0,0,0.04)',
              backdropFilter: element.style?.backdropFilter || 'none',
              ...element.style,
            }}
          />
        )

      case 'text': {
        const font = element.font || { family: 'Inter', size: 16, weight: '400', color: '#334155' }
        return (
          <div
            className="w-full h-full flex flex-col justify-center"
            style={{
              textAlign: element.align || 'left',
              backgroundColor: element.highlight ? (element.highlightColor || trackColor.accent) : (element.style?.backgroundColor || 'transparent'),
              padding: element.highlight ? '6px 12px' : (element.style?.padding || '0px'),
              borderRadius: element.highlight ? '6px' : (element.style?.borderRadius || '0px'),
            }}
          >
            {isEditing ? (
              <textarea
                ref={inputRef}
                className="w-full h-full bg-white/95 text-slate-900 border border-cyan-500 rounded p-2 outline-none resize-none shadow-md font-sans"
                style={{
                  fontFamily: font.family,
                  fontSize: `${Math.min(font.size, 24)}px`,
                  fontWeight: font.weight,
                  color: font.color,
                  textAlign: element.align || 'left',
                }}
                value={element.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
              />
            ) : (
              <div
                style={{
                  fontFamily: font.family === 'Georgia' ? 'Georgia, serif' : font.family === 'monospace' ? '"Courier New", Courier, monospace' : 'Inter, sans-serif',
                  fontSize: `${font.size}px`,
                  fontWeight: font.weight,
                  color: font.color || '#334155',
                  lineHeight: element.style?.lineHeight || '1.6',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {element.content}
              </div>
            )}
          </div>
        )
      }

      case 'image':
        return (
          <div
            className="w-full h-full overflow-hidden shadow-xs"
            style={{
              borderRadius: `${element.borderRadius ?? 12}px`,
              border: element.border || '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <img
              src={element.src}
              alt={element.alt || ''}
              className="w-full h-full pointer-events-none"
              style={{ objectFit: element.fit || 'cover' }}
              draggable={false}
            />
          </div>
        )

      case 'shape': {
        const isCircle = element.shape === 'circle'
        const isTriangle = element.shape === 'triangle'
        const isStar = element.shape === 'star'
        return (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: isTriangle || isStar ? 'transparent' : (element.fill || '#3b82f6'),
              borderRadius: isCircle ? '50%' : `${element.borderRadius ?? 8}px`,
              border: element.stroke && element.stroke !== 'none' ? element.stroke : 'none',
              opacity: element.opacity ?? 1,
              clipPath: isTriangle
                ? 'polygon(50% 0%, 0% 100%, 100% 100%)'
                : isStar
                ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                : 'none',
              ...(isTriangle || isStar ? { backgroundColor: element.fill || '#3b82f6' } : {}),
            }}
          />
        )
      }

      case 'icon': {
        const IconComponent = ICON_MAP[element.icon] || Star
        const size = element.size || Math.min(element.width || 48, element.height || 48)
        return (
          <div
            className="w-full h-full flex items-center justify-center select-none"
            style={{
              color: element.color || '#f59e0b',
            }}
          >
            <IconComponent size={size} />
          </div>
        )
      }

      case 'logo':
        return (
          <div className="w-full h-full flex items-center justify-center p-1">
            <div className="w-full h-full rounded-full border-2 border-slate-900 bg-white flex flex-col items-center justify-center shadow-md">
              <span className="font-serif font-black text-xs text-slate-900 leading-none">SWE</span>
              <span className="font-serif italic text-[8px] text-blue-600 leading-none">notebook</span>
            </div>
          </div>
        )

      case 'badge': {
        const font = element.font || { family: 'monospace', size: 12, weight: 'bold', color: trackColor.primary }
        return (
          <div
            className="w-full h-full flex items-center justify-center px-3 py-1 rounded-full border text-center"
            style={{
              backgroundColor: element.backgroundColor || 'rgba(30, 95, 168, 0.1)',
              borderColor: element.borderColor || trackColor.accent,
              fontFamily: font.family === 'monospace' ? '"Courier New", Courier, monospace' : 'inherit',
              fontSize: `${font.size}px`,
              fontWeight: font.weight,
              color: font.color || trackColor.primary,
              letterSpacing: '1px',
            }}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                className="w-full bg-transparent outline-none text-center"
                value={element.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
              />
            ) : (
              element.content
            )}
          </div>
        )
      }

      default:
        return null
    }
  }

  // Handle inverse scale so resize handles maintain constant 8px visual size at any zoom level
  const inverseZoom = 1 / (zoom || 1.0)
  const handleSize = 8 * inverseZoom

  return (
    <div
      style={baseStyle}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onDoubleClick={handleDoubleClick}
      onMouseDown={onMouseDown}
      className={`group ${
        isSelected
          ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-transparent shadow-lg'
          : 'hover:ring-1 hover:ring-cyan-400/50'
      }`}
    >
      {renderContent()}

      {/* 8-Point Figma-Style Resize Handles */}
      {isSelected && !isEditing && (
        <>
          {RESIZE_HANDLES.map((h) => (
            <div
              key={h.id}
              className="absolute z-50 bg-white border-2 border-cyan-500 rounded-xs shadow-md"
              style={{
                left: h.left,
                top: h.top,
                width: `${handleSize}px`,
                height: `${handleSize}px`,
                transform: 'translate(-50%, -50%)',
                cursor: h.cursor,
              }}
              onMouseDown={(e) => handleResizeMouseDown(e, h.id)}
            />
          ))}
        </>
      )}

      {/* Floating Quick Action Controls (Duplicate & Delete) */}
      {isSelected && !isEditing && (
        <div
          className="absolute -top-9 right-0 flex items-center gap-1 bg-[#1a1e2a]/95 border border-white/20 rounded-md p-1 shadow-xl z-50 pointer-events-auto"
          style={{
            transform: `scale(${Math.max(0.8, Math.min(1.2, inverseZoom))})`,
            transformOrigin: 'bottom right',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              onDuplicate()
            }}
            title="Duplicate (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            title="Delete (Backspace / Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
