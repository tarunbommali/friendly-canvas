import React, { useRef, useEffect } from 'react'

export const RULER_SIZE = 20

function pickStep(zoom) {
  const targetScreenGap = 60
  const rawStep = targetScreenGap / zoom
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]
  return steps.find((s) => s >= rawStep) || 1000
}

function setupCtx(canvas) {
  if (!canvas) return null
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#10131b'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = '9px monospace'
  return ctx
}

function drawHorizontal(canvas, zoom, panX, width, step, artboardWidth) {
  const ctx = setupCtx(canvas)
  if (!ctx) return

  const artStart = panX
  const artEnd = panX + artboardWidth * zoom
  ctx.fillStyle = 'rgba(6,182,212,0.08)'
  ctx.fillRect(Math.max(0, artStart), 0, Math.max(0, Math.min(width, artEnd) - Math.max(0, artStart)), RULER_SIZE)

  const firstTick = Math.floor(-panX / zoom / step) * step
  ctx.fillStyle = '#64748b'
  for (let v = firstTick; ; v += step) {
    const screenX = panX + v * zoom
    if (screenX > width) break
    if (screenX >= 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.beginPath()
      ctx.moveTo(screenX, RULER_SIZE)
      ctx.lineTo(screenX, RULER_SIZE - 6)
      ctx.stroke()
      ctx.fillText(String(v), screenX + 2, 9)
    }
  }
}

function drawVertical(canvas, zoom, panY, height, step, artboardHeight) {
  const ctx = setupCtx(canvas)
  if (!ctx) return

  const artStart = panY
  const artEnd = panY + artboardHeight * zoom
  ctx.fillStyle = 'rgba(6,182,212,0.08)'
  ctx.fillRect(0, Math.max(0, artStart), RULER_SIZE, Math.max(0, Math.min(height, artEnd) - Math.max(0, artStart)))

  const firstTick = Math.floor(-panY / zoom / step) * step
  ctx.fillStyle = '#64748b'
  for (let v = firstTick; ; v += step) {
    const screenY = panY + v * zoom
    if (screenY > height) break
    if (screenY >= 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.beginPath()
      ctx.moveTo(RULER_SIZE, screenY)
      ctx.lineTo(RULER_SIZE - 6, screenY)
      ctx.stroke()
      ctx.save()
      ctx.translate(9, screenY + 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(String(v), 0, 0)
      ctx.restore()
    }
  }
}

export default function Rulers({ zoom, pan, canvasWidth, canvasHeight, containerSize }) {
  const hRef = useRef(null)
  const vRef = useRef(null)

  useEffect(() => {
    if (!containerSize.width || !containerSize.height) return
    const step = pickStep(zoom)
    drawHorizontal(hRef.current, zoom, pan.x, containerSize.width, step, canvasWidth)
    drawVertical(vRef.current, zoom, pan.y, containerSize.height, step, canvasHeight)
  }, [zoom, pan.x, pan.y, containerSize.width, containerSize.height, canvasWidth, canvasHeight])

  if (!containerSize.width) return null

  return (
    <>
      <canvas
        ref={hRef}
        width={containerSize.width}
        height={RULER_SIZE}
        className="absolute top-0 left-0 z-30 pointer-events-none"
      />
      <canvas
        ref={vRef}
        width={RULER_SIZE}
        height={containerSize.height}
        className="absolute top-0 left-0 z-30 pointer-events-none"
      />
      <div
        className="absolute top-0 left-0 z-40 bg-[#10131b] border-r border-b border-white/10"
        style={{ width: RULER_SIZE, height: RULER_SIZE }}
      />
    </>
  )
}
