import React from 'react'
import { Globe, Cpu, Box, Database, Cloud, Lock, ArrowRight } from 'lucide-react'

/**
 * ArchitectureBlueprint — System design nodes Layout Archetype
 * Clean nodes with directional request/response flow arrows.
 */
export default function ArchitectureBlueprint({ data = {}, config = {} }) {
  const { title, nodes = [], content, flow, visualDirective } = data
  const { showFlow = true } = config
  const { primary, accent } = data.trackColor || { primary: '#1E5FA8', accent: '#A9D0F5' }
  const trackNo = String(data.trackNo || '01').padStart(2, '0')

  // Parse nodes: accept array of strings or semicolon-separated string
  let nodeItems = []
  if (Array.isArray(nodes) && nodes.length > 0) {
    nodeItems = nodes
  } else if (content) {
    nodeItems = content.split(/[;\n]/).filter(Boolean).map((s) => s.trim())
  }

  const nodeIcons = [Globe, Cpu, Box, Database, Cloud, Lock]

  return (
    <div className="flex-1 flex flex-col">
      {/* Track Header */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className="font-mono text-xs font-extrabold uppercase tracking-wider shrink-0"
          style={{ color: primary }}
        >
          TRACK {trackNo}
        </span>
        <span
          className="flex-1 h-[2px] rounded-full opacity-80"
          style={{ backgroundColor: accent }}
        />
      </div>

      {/* Badge */}
      <div className="mb-2">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider border"
          style={{
            color: primary,
            backgroundColor: `${primary}15`,
            borderColor: `${primary}30`,
          }}
        >
          [ ARCHITECTURE ]
        </span>
      </div>

      {/* Title */}
      <div className="mb-4">
        <h2 className="font-serif text-xl font-bold text-slate-950 leading-tight inline">
          <span
            className="inline px-2 py-0.5 rounded-sm"
            style={{ backgroundColor: accent, color: '#0f172a' }}
          >
            {title}
          </span>
        </h2>
      </div>

      {/* Blueprint Diagram */}
      <div className="flex-1 flex flex-col justify-center">
        <div
          className="rounded-xl p-4 border"
          style={{
            backgroundColor: '#f8fafc',
            borderColor: `${primary}30`,
            backgroundImage: `radial-gradient(circle, ${primary}08 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            {nodeItems.map((node, idx) => {
              const NodeIcon = nodeIcons[idx % nodeIcons.length]
              return (
                <React.Fragment key={idx}>
                  {/* Node Box */}
                  <div
                    className="flex flex-col items-center gap-1.5 p-3 rounded-lg border bg-white min-w-[85px] shadow-xs"
                    style={{ borderColor: `${primary}40` }}
                  >
                    <div
                      className="p-1.5 rounded-md"
                      style={{ backgroundColor: `${primary}10`, color: primary }}
                    >
                      <NodeIcon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 text-center leading-tight">
                      {typeof node === 'string' ? node : node.name || node}
                    </span>
                  </div>

                  {/* Flow Arrow */}
                  {showFlow && idx < nodeItems.length - 1 && (
                    <div style={{ color: primary }} className="shrink-0">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>

          {/* Flow Description */}
          {flow && (
            <p
              className="mt-3 text-xs text-center font-mono m-0"
              style={{ color: primary }}
            >
              {flow}
            </p>
          )}
        </div>
      </div>

      {/* Visual Directive */}
      {visualDirective && (
        <div className="mt-3 text-xs text-slate-500 bg-slate-50/95 p-2 rounded border border-slate-200">
          <span className="font-bold text-[10px] uppercase text-slate-400 block font-mono">Visual Directive</span>
          <p className="m-0 text-xs">{visualDirective}</p>
        </div>
      )}
    </div>
  )
}
