import React, { useState } from 'react'

export function PromptDisplay({ prompt, onCopy, className = '' }) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    if (onCopy) {
      onCopy(prompt)
    } else {
      await navigator.clipboard.writeText(prompt)
    }
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className={`flex flex-col gap-2 p-3.5 rounded-xl bg-black/35 border border-white/5 font-sans ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold text-yellow-400 text-[11px] flex items-center gap-1.5">
          🎨 Content Asset Prompt (Illustration & Diagram):
        </span>
        <button
          onClick={handleCopy}
          className="px-2.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold transition-colors cursor-pointer"
        >
          {isCopied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <textarea
        readOnly
        className="w-full bg-[#0d1117] border border-white/10 rounded-lg p-3 text-xs font-mono text-blue-200 leading-relaxed min-h-[130px] focus:border-cyan-400/40 focus:outline-none resize-y"
        value={prompt}
        spellCheck={false}
      />
    </div>
  )
}
export default PromptDisplay
