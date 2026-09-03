import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCarouselStore } from "../store/carouselStore";
import { CanvasEditor } from "../components/CanvasEditor";
import { DEFAULT_GLOBAL_LAYOUT_CONFIG } from "../theme/defaultGlobalLayout";
import { useEditorKeyboardShortcuts } from "../hooks/useEditorKeyboardShortcuts";
import {
  ArrowLeft,
  Type,
  Layout,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Move,
  Eye,
  ArrowRight,
  UserPlus,
  Hash,
  Grid,
} from "lucide-react";

const FONT_OPTIONS = [
  { value: "Instrument Serif", label: "Instrument Serif (Editorial Serif)" },
  { value: "Georgia", label: "Georgia (Classic Serif)" },
  { value: "Inter", label: "Inter (Modern Sans)" },
  { value: "JetBrains Mono", label: "JetBrains Mono (Monospace)" },
  { value: "Playfair Display", label: "Playfair Display (Serif)" },
  { value: "Roboto", label: "Roboto (Clean Sans)" },
  { value: "Arial", label: "Arial (Standard Sans)" },
];

// ───────────────────────────────────────
// 1. Reusable sub‑components
// ───────────────────────────────────────

function ColorInput({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-slate-400 text-[11px] font-medium mr-1">{label}</span>}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-1.5 text-slate-100 font-mono text-[11px] focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}

function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-200">{label}</span>
        <span className="font-mono text-slate-100 text-sm font-bold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step || 1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500 bg-slate-950 cursor-pointer h-2 rounded-lg"
      />
    </div>
  );
}

// ───────────────────────────────────────
// 2. Header
// ───────────────────────────────────────

function PageHeader({ onBack, onReset, onApply }) {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span>Setting</span>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onReset}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
        <button
          onClick={onApply}
          className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply Settings to All Slides</span>
        </button>
      </div>
    </header>
  );
}

// ───────────────────────────────────────
// 3. Sidebar Tabs
// ───────────────────────────────────────

function SidebarTabs({
  activeTab,
  setActiveTab,
  appliedToast,
}) {
  const tabs = [
    { id: "layout", label: "Layout (Title, Numbering, CTA)", icon: Layout },
    { id: "positions", label: "1. Element X/Y Positions", icon: Move },
    { id: "typography", label: "2. Typography & Fonts", icon: Type },
    { id: "margins", label: "3. Safe Area & Margins", icon: Grid },
    { id: "theme", label: "4. Theme & Aspect Ratio", icon: Palette },
  ];

  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-800 p-4 space-y-2 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
      {appliedToast && (
        <div className="mt-6 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Applied settings to all slides in real-time!</span>
        </div>
      )}
    </aside>
  );
}

// ───────────────────────────────────────
// 4. Layout Tab Content (sub‑sections)
// ───────────────────────────────────────

function LayoutTabContent({ config, onChange }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Layout className="w-4 h-4 text-blue-400" />
          <span>Global Layout: Title, Numbering, Swipe & CTA</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure universal positioning rules for titles, slide numbering, swipe indicators, and closing follow CTAs across all slides in this carousel.
        </p>
      </div>

      {/* Badge Section */}
      <LayoutSection
        title='1. Header Badge & Post Title Placement ("SWE NOTEBOOK")'
        icon={<Type className="w-4 h-4 text-amber-400" />}
        color="amber"
        fields={[
          { label: "Badge Custom Label", key: "badgeText", type: "text", placeholder: "e.g. SWE NOTEBOOK / Collection Category" },
          { label: "Text Color", key: "badgeColor", type: "color", default: config.badgeColor || config.primaryColor || "#C84B31" },
          { label: "X Position (px)", key: "badgeX", type: "number", default: 140 },
          { label: "Y Position (px)", key: "badgeY", type: "number", default: 104 },
          { label: "Font Size (px)", key: "badgeFontSize", type: "number", default: 20 },
          { label: "Font Family", key: "badgeFont", type: "select", default: "Playfair Display", options: FONT_OPTIONS },
        ]}
        config={config}
        onChange={onChange}
        presets={[
          { label: "Top Left (Default)", values: { badgeX: 140, badgeY: 104 } },
          { label: "Top Center", values: { badgeX: 540, badgeY: 104 } },
          { label: "Top Right", values: { badgeX: 940, badgeY: 104 } },
        ]}
      />

      {/* Headline Section */}
      <LayoutSection
        title="2. Main Slide Headline Placement (Headline Text)"
        icon={<Type className="w-4 h-4 text-blue-400" />}
        color="blue"
        fields={[
          { label: "X Position (px)", key: "headlineX", type: "number", default: 140 },
          { label: "Y Position (px)", key: "headlineY", type: "number", default: 210 },
          { label: "Font Size (px)", key: "headlineFontSize", type: "number", default: 92 },
          { label: "Font Family", key: "headlineFont", type: "select", default: "Instrument Serif", options: FONT_OPTIONS },
        ]}
        config={config}
        onChange={onChange}
        extra={
          <div className="flex items-center justify-between gap-4 pt-1">
            <div>
              <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">Text Alignment</span>
              <div className="flex items-center gap-1.5">
                {["left", "center", "right"].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onChange("textAlign", align)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium capitalize border transition-all ${
                      (config.textAlign || "left") === align
                        ? "bg-blue-600 border-blue-500 text-white shadow-sm"
                        : "bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">Quick Layout Presets</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    onChange("headlineX", 140);
                    onChange("headlineY", 210);
                    onChange("textAlign", "left");
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                >
                  Default (Top Left)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange("headlineX", 540);
                    onChange("headlineY", 210);
                    onChange("textAlign", "center");
                  }}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                >
                  Centered Title
                </button>
              </div>
            </div>
          </div>
        }
      />

      {/* Numbering Section */}
      <LayoutSection
        title="3. Slide Numbering Placement (Page Counter)"
        icon={<Hash className="w-4 h-4 text-cyan-400" />}
        color="cyan"
        fields={[
          { label: "X Position (px)", key: "pageNumberX", type: "number", default: 80 },
          { label: "Y Position (px)", key: "pageNumberY", type: "number", default: 1246 },
          { label: "Font Size (px)", key: "pageNumberFontSize", type: "number", default: 24 },
          { label: "Font Family", key: "pageNumberFont", type: "select", default: "Georgia", options: FONT_OPTIONS },
          { label: "Text Color", key: "pageNumberColor", type: "color", default: "#94a3b8" },
        ]}
        config={config}
        onChange={onChange}
        presets={[
          { label: "Bottom Left (Default)", values: { pageNumberX: 80, pageNumberY: 1246 } },
          { label: "Bottom Center", values: { pageNumberX: 540, pageNumberY: 1246 } },
          { label: "Top Right", values: { pageNumberX: 1000, pageNumberY: 110 } },
        ]}
      />

      {/* Swipe Section */}
      <LayoutSection
        title="4. Swipe Indicator Placement (Mid Slides CTA)"
        icon={<ArrowRight className="w-4 h-4 text-emerald-400" />}
        color="emerald"
        fields={[
          { label: "Swipe CTA Label", key: "swipeText", type: "text", default: "Swipe →" },
          { label: "Font Family", key: "swipeFont", type: "select", default: "Georgia", options: FONT_OPTIONS },
          { label: "Text Color", key: "swipeColor", type: "color", default: "#94a3b8" },
          { label: "X Position (px)", key: "swipeX", type: "number", default: 1000 },
          { label: "Y Position (px)", key: "swipeY", type: "number", default: 1246 },
          { label: "Font Size (px)", key: "swipeFontSize", type: "number", default: 24 },
        ]}
        config={config}
        onChange={onChange}
      />

      {/* Follow Section */}
      <LayoutSection
        title="5. Last Slide Follow CTA Placement (Closing Slide)"
        icon={<UserPlus className="w-4 h-4 text-purple-400" />}
        color="purple"
        fields={[
          { label: "Closing Slide CTA Text", key: "followText", type: "text", default: "Follow for more →" },
          { label: "Font Family", key: "followFont", type: "select", default: "Georgia", options: FONT_OPTIONS },
          { label: "Text Color", key: "followColor", type: "color", default: "#94a3b8" },
          { label: "X Position (px)", key: "followX", type: "number", default: 1000 },
          { label: "Y Position (px)", key: "followY", type: "number", default: 1246 },
          { label: "Font Size (px)", key: "followFontSize", type: "number", default: 24 },
        ]}
        config={config}
        onChange={onChange}
        extra={
          <div>
            <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">Quick CTA Presets</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["Follow for more →", "Save for later 🔖", "Share with friends 🚀", "Read next collection →"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange("followText", preset)}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        }
      />
    </div>
  );
}

// Helper component for each layout section
function LayoutSection({
  title,
  icon,
  color,
  fields,
  config,
  onChange,
  presets,
  extra,
}) {
  const colorClass = `text-${color}-400 bg-${color}-500/10 border border-${color}-500/30`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
          {icon}
          <span>{title}</span>
        </div>
        <span className={`font-mono text-[11px] ${colorClass} px-2 py-0.5 rounded-full`}>
          {fields
            .filter((f) => f.key === "badgeX" || f.key === "badgeY" || f.key === "headlineX" || f.key === "headlineY" || f.key === "pageNumberX" || f.key === "pageNumberY" || f.key === "swipeX" || f.key === "swipeY" || f.key === "followX" || f.key === "followY" || f.key === "badgeFontSize" || f.key === "headlineFontSize" || f.key === "pageNumberFontSize" || f.key === "swipeFontSize" || f.key === "followFontSize")
            .map((f) => {
              const val = config[f.key] ?? f.default;
              return `${f.label.split('(')[0].trim()}: ${val}${f.key.includes('Size') ? 'px' : ''}`;
            })
            .join(' | ')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {fields.map((f) => {
          if (f.type === "color") {
            return (
              <div key={f.key}>
                <label className="block text-slate-400 mb-1 font-medium">{f.label}</label>
                <ColorInput
                  value={config[f.key] ?? f.default}
                  onChange={(val) => onChange(f.key, val)}
                />
              </div>
            );
          }
          if (f.type === "select") {
            return (
              <div key={f.key}>
                <label className="block text-slate-400 mb-1 font-medium">{f.label}</label>
                <select
                  value={config[f.key] ?? f.default}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 font-sans focus:border-blue-500 focus:outline-none cursor-pointer"
                >
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            );
          }
          return (
            <div key={f.key}>
              <label className="block text-slate-400 mb-1 font-medium">{f.label}</label>
              <input
                type={f.type}
                value={config[f.key] ?? f.default}
                onChange={(e) => onChange(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          );
        })}
      </div>

      {presets && (
        <div>
          <span className="block text-[11px] text-slate-400 mb-1.5 font-medium">Position Presets</span>
          <div className="flex items-center gap-2 flex-wrap">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  Object.entries(preset.values).forEach(([key, val]) => onChange(key, val));
                }}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {extra && extra}
    </div>
  );
}

// ───────────────────────────────────────
// 5. Positions Tab Content
// ───────────────────────────────────────

function PositionsTabContent({ config, onChange }) {
  const positionSections = [
    {
      title: "1. Headline Content Element",
      icon: <Type className="w-4 h-4 text-blue-400" />,
      color: "blue",
      fields: [
        { label: "X Position (px)", key: "headlineX", default: 140 },
        { label: "Y Position (px)", key: "headlineY", default: 210 },
        { label: "Font Size (px)", key: "headlineFontSize", default: 92 },
        { label: "Text Color", key: "headlineColor", type: "color", default: "#0f172a" },
      ],
    },
    {
      title: "2. Body Text Paragraph Element",
      icon: <Type className="w-4 h-4 text-emerald-400" />,
      color: "emerald",
      fields: [
        { label: "X Position (px)", key: "bodyX", default: 140 },
        { label: "Y Position (px)", key: "bodyY", default: 340 },
        { label: "Font Size (px)", key: "bodyFontSize", default: 30 },
        { label: "Text Color", key: "bodyColor", type: "color", default: "#475569" },
      ],
    },
    {
      title: "3. Directive Container Box (Rect)",
      icon: <Layout className="w-4 h-4 text-amber-400" />,
      color: "amber",
      fields: [
        { label: "Center X (px)", key: "dirRectX", default: 540 },
        { label: "Center Y (px)", key: "dirRectY", default: 700 },
        { label: "Width (px)", key: "dirRectWidth", default: 800 },
        { label: "Height (px)", key: "dirRectHeight", default: 300 },
        { label: "Fill Color", key: "dirRectFill", type: "color", default: "#fef3c7" },
        { label: "Stroke Color", key: "dirRectStroke", type: "color", default: "#d97706" },
        { label: "Stroke Width (px)", key: "dirRectStrokeWidth", default: 2 },
      ],
    },
    {
      title: "4. Directive Text Label Element",
      icon: <Type className="w-4 h-4 text-purple-400" />,
      color: "purple",
      fields: [
        { label: "X Position (px)", key: "dirTextX", default: 540 },
        { label: "Y Position (px)", key: "dirTextY", default: 700 },
        { label: "Font Size (px)", key: "dirTextFontSize", default: 24 },
        { label: "Text Color", key: "dirTextColor", type: "color", default: "#8e5c29" },
      ],
    },
    {
      title: "5. Slide Number Badge (Page No)",
      icon: <Hash className="w-4 h-4 text-red-400" />,
      color: "red",
      fields: [
        { label: "X Position (px)", key: "pageNumberX", default: 140 },
        { label: "Y Position (px)", key: "pageNumberY", default: 1210 },
        { label: "Font Size (px)", key: "pageNumberFontSize", default: 24 },
        { label: "Text Color", key: "pageNumberColor", type: "color", default: "#64748b" },
      ],
    },
    {
      title: "6. Swipe Indicator Element (\"Swipe →\")",
      icon: <ArrowRight className="w-4 h-4 text-pink-400" />,
      color: "pink",
      fields: [
        { label: "X Position (px)", key: "swipeX", default: 940 },
        { label: "Y Position (px)", key: "swipeY", default: 1210 },
        { label: "Font Size (px)", key: "swipeFontSize", default: 24 },
        { label: "Text Color", key: "swipeColor", type: "color", default: "#64748b" },
        { label: "Custom Swipe Label", key: "swipeText", type: "text", default: "Swipe →" },
      ],
    },
    {
      title: "7. Follow CTA Element (\"Follow for more →\")",
      icon: <UserPlus className="w-4 h-4 text-cyan-400" />,
      color: "cyan",
      fields: [
        { label: "X Position (px)", key: "followX", default: 940 },
        { label: "Y Position (px)", key: "followY", default: 1210 },
        { label: "Font Size (px)", key: "followFontSize", default: 24 },
        { label: "Text Color", key: "followColor", type: "color", default: "#64748b" },
        { label: "Custom Follow CTA Text", key: "followText", type: "text", default: "Follow for more →" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Move className="w-4 h-4 text-blue-400" />
          <span>Element Positions & Transform Defaults</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Adjust exact X/Y pixel coordinates or drag elements directly on the Canvas Editor Preview. Changes synchronize live across all slides.
        </p>
      </div>

      {positionSections.map((section) => (
        <div key={section.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-slate-100 font-semibold text-xs">
              {section.icon}
              <span>{section.title}</span>
            </div>
            <span className={`font-mono text-[11px] text-${section.color}-400 bg-${section.color}-500/10 border border-${section.color}-500/30 px-2 py-0.5 rounded-full`}>
              {section.fields
                .filter((f) => f.key.includes("X") || f.key.includes("Y"))
                .map((f) => {
                  const val = config[f.key] ?? f.default;
                  return `${f.label.split('(')[0].trim()}: ${val}px`;
                })
                .join(' | ')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {section.fields.map((f) => {
              if (f.type === "color") {
                return (
                  <div key={f.key} className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-400 mb-1 font-medium">{f.label}</label>
                    <ColorInput
                      value={config[f.key] ?? f.default}
                      onChange={(val) => onChange(f.key, val)}
                    />
                  </div>
                );
              }
              if (f.type === "text") {
                return (
                  <div key={f.key} className="col-span-2 sm:col-span-1">
                    <label className="block text-slate-400 mb-1 font-medium">{f.label}</label>
                    <input
                      type="text"
                      value={config[f.key] ?? f.default}
                      onChange={(e) => onChange(f.key, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                );
              }
              return (
                <div key={f.key}>
                  <label className="block text-slate-400 mb-1 font-medium">{f.label}</label>
                  <input
                    type="number"
                    value={config[f.key] ?? f.default}
                    onChange={(e) => onChange(f.key, Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────
// 6. Typography Tab Content
// ───────────────────────────────────────

function TypographyTabContent({ config, onChange }) {
  const sections = [
    {
      title: "Headline Typography Settings",
      icon: <Type className="w-4 h-4 text-blue-400" />,
      fields: [
        { label: "Headline Font Family", key: "headlineFont", type: "select", default: "Instrument Serif", options: FONT_OPTIONS },
        { label: "Headline Size (px)", key: "headlineFontSize", type: "number", default: 44 },
        { label: "Headline Text Color", key: "headlineColor", type: "color", default: "#0f172a" },
      ],
    },
    {
      title: "Body Copy & Paragraph Typography",
      icon: <Type className="w-4 h-4 text-emerald-400" />,
      fields: [
        { label: "Body Font Family", key: "bodyFont", type: "select", default: "Georgia", options: FONT_OPTIONS },
        { label: "Body Font Size (px)", key: "bodyFontSize", type: "number", default: 30 },
        { label: "Body Text Color", key: "bodyColor", type: "color", default: "#475569" },
      ],
    },
    {
      title: "Directive Label & Accent Typography",
      icon: <Type className="w-4 h-4 text-purple-400" />,
      fields: [
        { label: "Directive Text Size (px)", key: "dirTextFontSize", type: "number", default: 24 },
        { label: "Directive Text Color", key: "dirTextColor", type: "color", default: "#8e5c29" },
      ],
    },
    {
      title: "Footer Numbering & CTA Typography",
      icon: <Hash className="w-4 h-4 text-cyan-400" />,
      fields: [
        { label: "Page Number Font", key: "pageNumberFont", type: "select", default: "Georgia", options: FONT_OPTIONS },
        { label: "Swipe CTA Font", key: "swipeFont", type: "select", default: "Georgia", options: FONT_OPTIONS },
        { label: "Follow CTA Font", key: "followFont", type: "select", default: "Georgia", options: FONT_OPTIONS },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Type className="w-4 h-4 text-blue-400" />
          <span>Typography, Fonts & Text Sizing</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure font families, base sizes, and text colors across headlines, body paragraphs, and collection badges.
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="text-slate-100 font-semibold text-xs border-b border-slate-800 pb-2 flex items-center gap-2">
            {section.icon}
            <span>{section.title}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {section.fields.map((f) => {
              if (f.type === "color") {
                return (
                  <div key={f.key}>
                    <label className="block text-slate-400 mb-1 font-medium">{f.label}</label>
                    <ColorInput
                      value={config[f.key] ?? f.default}
                      onChange={(val) => onChange(f.key, val)}
                    />
                  </div>
                );
              }
              if (f.type === "select") {
                return (
                  <div key={f.key}>
                    <label className="block text-slate-400 mb-1 font-medium">{f.label}</label>
                    <select
                      value={config[f.key] ?? f.default}
                      onChange={(e) => onChange(f.key, e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      {f.options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              return (
                <div key={f.key}>
                  <label className="block text-slate-400 mb-1 font-medium">{f.label}</label>
                  <input
                    type="number"
                    value={config[f.key] ?? f.default}
                    onChange={(e) => onChange(f.key, Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ───────────────────────────────────────
// 7. Margins Tab Content
// ───────────────────────────────────────

function MarginsTabContent({
  config,
  onChange,
  onReset,
  onApply,
}) {
  const handleMarginChange = (field, value) => {
    const num = Number(value);
    onChange(field, num);
    // also update safeArea counterparts if they exist
    const safeMap = {
      marginTop: "safeAreaMarginTop",
      marginRight: "safeAreaMarginRight",
      marginBottom: "safeAreaMarginBottom",
      marginLeft: "safeAreaMarginLeft",
    };
    if (safeMap[field]) {
      onChange(safeMap[field], num);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Layout & theme settings</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Applies to every slide unless overridden.</p>
        </div>

        {/* Toggles */}
        <div className="space-y-3 border-b border-slate-800 pb-5">
          <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Grid className="w-4 h-4 text-cyan-400" />
              <span>Show grid</span>
            </div>
            <input
              type="checkbox"
              checked={Boolean(config.showGrid)}
              onChange={(e) => onChange("showGrid", e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Snap to guides</span>
            </div>
            <input
              type="checkbox"
              checked={config.snapToGuides !== false}
              onChange={(e) => onChange("snapToGuides", e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </label>
        </div>

        {/* Margin inputs */}
        <div className="space-y-2 border-b border-slate-800 pb-5">
          <label className="block text-xs font-semibold text-slate-200">Margin (px)</label>
          <div className="grid grid-cols-4 gap-3">
            {["Top", "Right", "Bottom", "Left"].map((dir) => {
              const field = `margin${dir}`;
              const safeField = `safeAreaMargin${dir}`;
              const value = config[field] ?? config[safeField] ?? 30;
              return (
                <div key={dir} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center space-y-1">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleMarginChange(field, e.target.value)}
                    className="w-full text-center bg-transparent font-bold text-base text-slate-100 focus:outline-none"
                  />
                  <span className="block text-[11px] text-slate-500">{dir}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 border-b border-slate-800 pb-5">
          <RangeSlider
            label="Grid columns"
            value={config.gridColumns ?? 4}
            min={2}
            max={12}
            onChange={(val) => onChange("gridColumns", val)}
          />
          <RangeSlider
            label="Gutter width (px)"
            value={config.gutterWidth ?? 16}
            min={0}
            max={60}
            step={2}
            onChange={(val) => onChange("gutterWidth", val)}
          />
          <RangeSlider
            label="Element padding (px)"
            value={config.elementPadding ?? 14}
            min={0}
            max={40}
            onChange={(val) => onChange("elementPadding", val)}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={onReset}
            className="flex-1 py-3 px-4 bg-slate-950 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 transition-colors"
          >
            Reset to defaults
          </button>
          <button
            onClick={onApply}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
            Apply to all slides
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────
// 8. Theme Tab Content
// ───────────────────────────────────────

function ThemeTabContent({ config, onChange }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <span>Theme, Aspect Ratio & Background Pattern</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure canvas aspect ratio, collection colors, patterns, and font choices. Updates the Live Preview instantly.
        </p>
      </div>

      {/* Aspect Ratio */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2 font-semibold text-xs text-slate-100">
            <Layout className="w-4 h-4 text-blue-400" />
            <span>Canvas Aspect Ratio</span>
          </div>
          <span className="font-mono text-[11px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase">
            {config.aspectRatio || "4:5"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "4:5", label: "4:5 Portrait", dim: "1080 × 1350 px", sub: "Instagram Portrait" },
            { id: "1:1", label: "1:1 Square", dim: "1080 × 1080 px", sub: "Instagram Post" },
            { id: "9:16", label: "9:16 Vertical", dim: "1080 × 1920 px", sub: "Story / Reel" },
            { id: "16:9", label: "16:9 Landscape", dim: "1920 × 1080 px", sub: "Presentation" },
          ].map((ratio) => (
            <button
              key={ratio.id}
              type="button"
              onClick={() => onChange("aspectRatio", ratio.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                (config.aspectRatio || "4:5") === ratio.id
                  ? "bg-blue-600/20 border-blue-500 text-slate-100 shadow-lg shadow-blue-600/10 ring-1 ring-blue-500"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div>
                <div className="text-xs font-bold text-slate-100">{ratio.label}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ratio.dim}</div>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold mt-2">
                {ratio.sub}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors & Pattern */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
        <div className="text-slate-100 font-semibold text-xs border-b border-slate-800 pb-2 flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          <span>Collection Palette & Background Styles</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Primary Collection Color</label>
            <ColorInput
              value={config.primaryColor}
              onChange={(val) => onChange("primaryColor", val)}
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Accent Badge Color</label>
            <ColorInput
              value={config.accentColor}
              onChange={(val) => onChange("accentColor", val)}
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Slide Background Color</label>
            <ColorInput
              value={config.bgColor}
              onChange={(val) => onChange("bgColor", val)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Background Pattern</label>
            <select
              value={config.bgPattern}
              onChange={(e) => onChange("bgPattern", e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
            >
              <option value="solid">Solid Background</option>
              <option value="dots">Dots Pattern</option>
              <option value="grid">Grid Lines</option>
              <option value="lines">Notebook Lines</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium text-xs">Text Alignment</label>
            <div className="flex items-center gap-2">
              {["left", "center", "right"].map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onChange("textAlign", align)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                    config.textAlign === align
                      ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                  }`}
                >
                  {align} Align
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">Snap to guides while dragging</span>
          <button
            type="button"
            onClick={() => onChange("snapToGuides", !config.snapToGuides)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              config.snapToGuides
                ? "bg-blue-600 text-white border-blue-500"
                : "bg-slate-950 text-slate-400 border-slate-800"
            }`}
          >
            {config.snapToGuides ? "Snap ON" : "Snap OFF"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────
// 9. Preview Panel (right column)
// ───────────────────────────────────────

function PreviewPanel({ config, document }) {
  return (
    <div className="w-full lg:w-5/12 lg:sticky lg:top-4 self-start bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-100">Original Canvas Editor Preview</span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {document?.metadata?.width || 1080} × {document?.metadata?.height || 1350} ({config.aspectRatio || "4:5"})
        </span>
      </div>

      <div className="h-[520px] rounded-xl overflow-hidden border border-slate-800 relative bg-slate-950">
        <CanvasEditor isLayoutMode={true} />
      </div>

      {/* Dynamic Position Coordinates Readout Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-mono">
        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <span className="text-amber-400 font-bold block">Badge/Title:</span>
          <span className="text-slate-300">X:{config.badgeX ?? 140} Y:{config.badgeY ?? 104}</span>
        </div>
        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <span className="text-blue-400 font-bold block">Headline:</span>
          <span className="text-slate-300">X:{config.headlineX} Y:{config.headlineY}</span>
        </div>
        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <span className="text-emerald-400 font-bold block">Body Text:</span>
          <span className="text-slate-300">X:{config.bodyX} Y:{config.bodyY}</span>
        </div>
        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <span className="text-cyan-400 font-bold block">Numbering:</span>
          <span className="text-slate-300">X:{config.pageNumberX} Y:{config.pageNumberY}</span>
        </div>
        <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <span className="text-purple-400 font-bold block">Swipe/CTA:</span>
          <span className="text-slate-300">X:{config.swipeX} Y:{config.swipeY}</span>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────
// 10. Main Page
// ───────────────────────────────────────

export function GlobalLayoutSettingsPage() {
  useEditorKeyboardShortcuts();
  const navigate = useNavigate();
  const { collectionId, postId, projectSlug } = useParams();

  const globalLayoutConfig = useCarouselStore((state) => state.globalLayoutConfig);
  const applyGlobalLayoutConfigToAllSlides = useCarouselStore(
    (state) => state.applyGlobalLayoutConfigToAllSlides
  );
  const setGlobalLayoutConfig = useCarouselStore(
    (state) => state.setGlobalLayoutConfig
  );
  const document = useCarouselStore((state) => state.document);

  const [activeTab, setActiveTab] = useState("layout");
  const [appliedToast, setAppliedToast] = useState(false);
  const applyTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    };
  }, []);

  const config = globalLayoutConfig;

  const handleChange = (field, value) => {
    const numericFields = [
      "badgeX", "badgeY", "badgeFontSize",
      "headlineX", "headlineY", "headlineFontSize",
      "bodyX", "bodyY", "bodyFontSize",
      "dirRectX", "dirRectY", "dirRectWidth", "dirRectHeight", "dirRectStrokeWidth",
      "dirTextX", "dirTextY", "dirTextFontSize",
      "pageNumberX", "pageNumberY", "pageNumberFontSize",
      "swipeX", "swipeY", "swipeFontSize",
      "followX", "followY", "followFontSize",
      "safeAreaMarginTop", "safeAreaMarginBottom", "safeAreaMarginLeft", "safeAreaMarginRight",
      "marginTop", "marginRight", "marginBottom", "marginLeft",
      "gridColumns", "gutterWidth", "elementPadding",
      "contentTopClearance", "contentBottomClearance", "contentPaddingLeft", "contentPaddingRight",
    ];

    const parsedValue = numericFields.includes(field) ? Number(value) : value;
    setGlobalLayoutConfig({ [field]: parsedValue });

    if (applyTimerRef.current) clearTimeout(applyTimerRef.current);
    applyTimerRef.current = setTimeout(() => {
      applyGlobalLayoutConfigToAllSlides();
    }, 200);
  };

  const handleApplyAll = () => {
    applyGlobalLayoutConfigToAllSlides(config);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 3000);
  };

  const handleResetDefaults = () => {
    applyGlobalLayoutConfigToAllSlides({ ...DEFAULT_GLOBAL_LAYOUT_CONFIG });
  };

  const handleBackToEditor = () => {
    if (projectSlug && collectionId && postId) {
      navigate(`/${projectSlug}/design/collection/${collectionId}/post/${postId}`);
    } else if (collectionId && postId) {
      navigate(`/design/collection/${collectionId}/post/${postId}`);
    } else if (postId) {
      navigate(`/design/${postId}`);
    } else {
      navigate('/canvas-editor');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "layout":
        return <LayoutTabContent config={config} onChange={handleChange} />;
      case "positions":
        return <PositionsTabContent config={config} onChange={handleChange} />;
      case "typography":
        return <TypographyTabContent config={config} onChange={handleChange} />;
      case "margins":
        return (
          <MarginsTabContent
            config={config}
            onChange={handleChange}
            onReset={handleResetDefaults}
            onApply={handleApplyAll}
          />
        );
      case "theme":
        return <ThemeTabContent config={config} onChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden font-sans min-h-0">
      <PageHeader
        onBack={handleBackToEditor}
        onReset={handleResetDefaults}
        onApply={handleApplyAll}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <SidebarTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          appliedToast={appliedToast}
        />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-7/12 space-y-6">
              {renderTabContent()}
            </div>

            <PreviewPanel config={config} document={document} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default GlobalLayoutSettingsPage;
