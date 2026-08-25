import React, { useState } from 'react'

export default function DesignSystemModal({
  designSystem,
  visualGlossary,
  isOpen,
  onClose,
  onCopy,
}) {
  const [activeTab, setActiveTab] = useState('LayoutCategorys')

  if (!isOpen || !designSystem) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content design-system-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            <span className="modal-badge">Design System & DNA</span>
            <h2>SWE Notebook Brand Standards</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'LayoutCategorys' ? 'active' : ''}`}
            onClick={() => setActiveTab('LayoutCategorys')}
          >
            📐 LayoutCategorys & Patterns
          </button>
          <button
            className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            🎨 20 Track Colors
          </button>
          <button
            className={`tab-btn ${activeTab === 'markers' ? 'active' : ''}`}
            onClick={() => setActiveTab('markers')}
          >
            🖍️ Markers & Typography
          </button>
          <button
            className={`tab-btn ${activeTab === 'glossary' ? 'active' : ''}`}
            onClick={() => setActiveTab('glossary')}
          >
            🧩 Visual Glossary
          </button>
          <button
            className={`tab-btn ${activeTab === 'conventions' ? 'active' : ''}`}
            onClick={() => setActiveTab('conventions')}
          >
            📸 Asset & Next Up Rules
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'LayoutCategorys' && (
            <div className="tab-pane">
              <h3>Slide LayoutCategorys & Extensible Layout Taxonomy</h3>
              <p className="tab-desc">Slides are not restricted to a rigid set — carousels combine 5 foundation LayoutCategorys with extensible specialized visual patterns.</p>

              <h4 style={{ color: 'var(--highlighter-yellow)', marginTop: '1rem', marginBottom: '0.6rem', fontSize: '0.9rem' }}>Foundation LayoutCategorys</h4>
              <div className="LayoutCategory-cards-grid">
                {Object.entries(designSystem.LayoutCategorys || {}).map(([key, desc]) => (
                  <div key={key} className="LayoutCategory-info-card">
                    <div className="LayoutCategory-card-head">
                      <span className="LayoutCategory-code">{key}</span>
                    </div>
                    <p className="LayoutCategory-desc">{desc}</p>
                  </div>
                ))}
              </div>

              <h4 style={{ color: 'var(--highlighter-cyan)', marginTop: '1.5rem', marginBottom: '0.6rem', fontSize: '0.9rem' }}>Specialized & Custom Layout Patterns</h4>
              <div className="LayoutCategory-cards-grid">
                <div className="LayoutCategory-info-card">
                  <div className="LayoutCategory-card-head">
                    <span className="LayoutCategory-code" style={{ color: 'var(--highlighter-cyan)', background: 'rgba(56, 189, 248, 0.1)' }}>3d-podium</span>
                  </div>
                  <p className="LayoutCategory-desc">3D isometric ranking steps (1, 2, 3) with floating tool logos and structured benchmark takeaways.</p>
                </div>
                <div className="LayoutCategory-info-card">
                  <div className="LayoutCategory-card-head">
                    <span className="LayoutCategory-code" style={{ color: 'var(--highlighter-lime)', background: 'rgba(166, 255, 0, 0.1)' }}>matrix-replace</span>
                  </div>
                  <p className="LayoutCategory-desc">2-column role-to-AI replacement matrix ("Can't Hire" vs "Use This") with arrows and official logos.</p>
                </div>
                <div className="LayoutCategory-info-card">
                  <div className="LayoutCategory-card-head">
                    <span className="LayoutCategory-code" style={{ color: 'var(--highlighter-lavender)', background: 'rgba(216, 180, 248, 0.1)' }}>slash-ui</span>
                  </div>
                  <p className="LayoutCategory-desc">Floating dark-mode terminal or smartphone card showcasing prompt shortcuts and highlighted inputs.</p>
                </div>
                <div className="LayoutCategory-info-card">
                  <div className="LayoutCategory-card-head">
                    <span className="LayoutCategory-code" style={{ color: 'var(--highlighter-pink)', background: 'rgba(253, 164, 175, 0.1)' }}>timeline-ribbon</span>
                  </div>
                  <p className="LayoutCategory-desc">Continuous chronological milestone line spanning slides, highlighting historical computing evolution.</p>
                </div>
                <div className="LayoutCategory-info-card">
                  <div className="LayoutCategory-card-head">
                    <span className="LayoutCategory-code" style={{ color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)' }}>architecture-blueprint</span>
                  </div>
                  <p className="LayoutCategory-desc">Clean system design nodes with directional request/response flow (Client ➔ LB ➔ Server ➔ DB).</p>
                </div>
                <div className="LayoutCategory-info-card">
                  <div className="LayoutCategory-card-head">
                    <span className="LayoutCategory-code" style={{ color: '#ffffff', background: 'rgba(255, 255, 255, 0.1)' }}>custom-hybrid</span>
                  </div>
                  <p className="LayoutCategory-desc">Extensible custom layouts supporting any technical diagram, comparison matrix, or interactive visual prompt.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="tab-pane">
              <h3>20 Track Color Palettes</h3>
              <p className="tab-desc">Unified brand canvas (#F8F7F4 paper grain) with customized track-specific accent palettes.</p>

              <div className="palette-grid">
                {Object.entries(designSystem.TrackColorPalettes || {}).map(([trackName, pal]) => (
                  <div key={trackName} className="palette-card">
                    <div
                      className="palette-preview-bar"
                      style={{
                        background: `linear-gradient(135deg, ${pal.primary}, ${pal.accent})`,
                      }}
                    />
                    <div className="palette-card-body">
                      <h4>{trackName}</h4>
                      <span className="palette-theme-name">{pal.palette}</span>
                      <div className="palette-hex-row">
                        <button
                          className="hex-badge"
                          onClick={() => onCopy(pal.primary, 'Primary Hex Copied', pal.primary)}
                          title="Click to copy"
                        >
                          <span className="dot" style={{ background: pal.primary }}></span>
                          Primary: {pal.primary}
                        </button>
                        <button
                          className="hex-badge"
                          onClick={() => onCopy(pal.accent, 'Accent Hex Copied', pal.accent)}
                          title="Click to copy"
                        >
                          <span className="dot" style={{ background: pal.accent }}></span>
                          Accent: {pal.accent}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'markers' && (
            <div className="tab-pane">
              <h3>Highlighter & Underline Color Palette</h3>

              <div className="markers-section">
                <h4>Fluorescent Highlighter Blocks</h4>
                <div className="markers-grid">
                  {Object.entries(designSystem.HighlighterMarkerPalette || {}).map(([name, hex]) => (
                    <div
                      key={name}
                      className="marker-item"
                      onClick={() => onCopy(hex, `${name} Copied`, hex)}
                      title="Click to copy hex"
                    >
                      <div className="marker-block" style={{ backgroundColor: hex }}>
                        <span className="marker-text">{name}</span>
                      </div>
                      <code className="marker-hex">{hex}</code>
                    </div>
                  ))}
                </div>
              </div>

              <div className="underlines-section">
                <h4>Pen Underline Rules</h4>
                <div className="underlines-grid">
                  {Object.entries(designSystem.PenUnderlineColors || {}).map(([name, val]) => (
                    <div key={name} className="underline-card">
                      <div className="underline-color-tag">
                        <strong>{name}:</strong> <code>{typeof val === 'object' ? val.hex : val}</code>
                      </div>
                      <p>{typeof val === 'object' ? val.meaning : val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {designSystem.Typography && (
                <div className="typography-section">
                  <h4>Typography Hierarchy</h4>
                  <div className="type-grid">
                    <div className="type-card">
                      <span className="type-label">Headlines</span>
                      <p className="type-value">{designSystem.Typography.Headline}</p>
                    </div>
                    <div className="type-card">
                      <span className="type-label">Body & Descriptions</span>
                      <p className="type-value">{designSystem.Typography.Body}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'glossary' && (
            <div className="tab-pane">
              <h3>Visual Glossary</h3>
              <p className="tab-desc">Standardized visual representations for recurring technical concepts.</p>

              <div className="glossary-grid">
                {Object.entries(visualGlossary || {}).map(([concept, desc]) => (
                  <div key={concept} className="glossary-card">
                    <div className="glossary-icon-badge">
                      <span>⚡ {concept}</span>
                    </div>
                    <p className="glossary-desc">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'conventions' && (
            <div className="tab-pane">
              <h3>Conventions & Production Guidelines</h3>

              {designSystem.ExternalAssetConvention && (
                <div className="convention-card">
                  <h4>📸 External Asset Convention</h4>
                  <p className="conv-purpose">{designSystem.ExternalAssetConvention.Purpose}</p>
                  <div className="conv-row">
                    <strong>Placeholder Pattern:</strong>
                    <code>{designSystem.ExternalAssetConvention.PlaceholderPattern}</code>
                  </div>
                  <div className="conv-row">
                    <strong>Rule:</strong>
                    <span>{designSystem.ExternalAssetConvention.Rule}</span>
                  </div>
                </div>
              )}

              {designSystem.AudioConvention && (
                <div className="convention-card audio">
                  <h4>🎵 Audio Convention</h4>
                  <p className="conv-purpose">{designSystem.AudioConvention.Purpose}</p>
                  <div className="conv-row">
                    <strong>Publishing Rule:</strong>
                    <span>{designSystem.AudioConvention.Rule}</span>
                  </div>
                </div>
              )}

              <div className="convention-card" style={{ borderColor: 'rgba(56, 189, 248, 0.3)', background: 'rgba(56, 189, 248, 0.03)' }}>
                <h4 style={{ color: 'var(--highlighter-cyan)' }}>🏷️ Standardized Next Up & Brand Logo Mapping</h4>
                <p className="conv-purpose">The closing Next Up slide is common across all posts with only the upcoming topic title changing. Features the official circular SWE Notebook logo (logo.png) as the brand seal.</p>
                <div className="conv-row">
                  <strong>Logo Asset:</strong>
                  <code>public/logo.png</code>
                </div>
                <div className="conv-row">
                  <strong>Swipe Rule:</strong>
                  <span>No bottom swipe arrow on the final slide. Replaced with follow/save CTA.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
