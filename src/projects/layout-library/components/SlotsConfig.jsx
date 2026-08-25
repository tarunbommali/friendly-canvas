import React from 'react'
import { Plus, X, SlidersHorizontal } from 'lucide-react'

export default function SlotsConfig({ slots = {}, onUpdateSlots }) {
  const handleUpdateSlot = (key, field, value) => {
    const updated = {
      ...slots,
      [key]: {
        ...slots[key],
        [field]: value,
      },
    }
    onUpdateSlots(updated)
  }

  const handleAddSlot = () => {
    const key = `slot_${Date.now().toString(36)}`
    const updated = {
      ...slots,
      [key]: {
        label: 'New Content Slot',
        type: 'text',
        required: true,
        default: 'Sample text...',
      },
    }
    onUpdateSlots(updated)
  }

  const handleDeleteSlot = (key) => {
    const updated = { ...slots }
    delete updated[key]
    onUpdateSlots(updated)
  }

  return (
    <div className="flex flex-col gap-4 font-sans select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Data Slots Schema
          </h3>
          <p className="text-[11px] text-slate-500">
            Define dynamic data fields for mapping content.
          </p>
        </div>
        <button
          type="button"
          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-400/30 transition-colors cursor-pointer flex items-center gap-1"
          onClick={handleAddSlot}
        >
          <Plus className="w-3.5 h-3.5" /> Add Slot
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries(slots).map(([key, slot]) => (
          <div
            key={key}
            className="p-3 rounded-xl bg-black/30 border border-white/10 flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-cyan-300">
                {slot.label || key}
              </span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <input
                    type="checkbox"
                    checked={slot.required ?? true}
                    onChange={(e) => handleUpdateSlot(key, 'required', e.target.checked)}
                    className="rounded border-white/20"
                  />
                  Required
                </label>
                <button
                  type="button"
                  className="text-slate-500 hover:text-red-400 text-xs cursor-pointer p-1"
                  onClick={() => handleDeleteSlot(key)}
                  title="Remove slot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-mono">Label</label>
                <input
                  type="text"
                  className="bg-black/40 border border-white/10 rounded p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={slot.label || ''}
                  onChange={(e) => handleUpdateSlot(key, 'label', e.target.value)}
                  placeholder="Field label"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400 font-mono">Type</label>
                <select
                  className="bg-black/40 border border-white/10 rounded p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                  value={slot.type || 'text'}
                  onChange={(e) => handleUpdateSlot(key, 'type', e.target.value)}
                >
                  <option value="text">Text (Single Line)</option>
                  <option value="textarea">Textarea (Multi-line)</option>
                  <option value="image">Image Asset</option>
                  <option value="color">Color Code</option>
                  <option value="array">Array / List</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 font-mono">Default Value</label>
              <input
                type="text"
                className="bg-black/40 border border-white/10 rounded p-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                value={slot.default || ''}
                onChange={(e) => handleUpdateSlot(key, 'default', e.target.value)}
                placeholder="Fallback default placeholder"
              />
            </div>
          </div>
        ))}

        {Object.keys(slots).length === 0 && (
          <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-slate-500 text-xs">
            No dynamic slots configured. Click &quot;Add Slot&quot; to define fields.
          </div>
        )}
      </div>
    </div>
  )
}
