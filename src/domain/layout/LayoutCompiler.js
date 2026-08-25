/**
 * LayoutCompiler.js
 * ────────────────
 * Compiles a Semantic Layout Definition + Content Slots + Track Theme
 * into an Editable Element Tree for Canvas and Rasterization.
 * 
 * Pipeline: LayoutDefinition + Content -> LayoutCompiler -> Editable Element Tree -> Canvas
 */

/**
 * Compiles layout slots and content into an array of canvas elements.
 */
export function compileLayoutToElements({
  layoutId = 'concept-explain',
  content = {},
  trackPalette = { primary: '#1E5FA8', accent: '#A9D0F5' },
  config = {},
  slideNo = 1,
  totalSlides = 7,
  trackName = 'Track 01',
}) {
  const primaryColor = trackPalette?.primary || '#1E5FA8'
  const accentColor = trackPalette?.accent || '#A9D0F5'
  const title = content.title || 'Slide Title'
  const body = content.body || content.explanation || content.content || ''
  const visualDirective = content.visualDirective || ''

  const baseElements = []

  switch (layoutId) {
    case 'hook-open': {
      baseElements.push(
        {
          id: `el_badge_${Date.now()}_1`,
          type: 'badge',
          content: `[ ${trackName} · ${trackPalette?.name || 'Curriculum'} ]`,
          x: 40,
          y: 48,
          width: 220,
          height: 32,
          font: { family: 'monospace', size: 12, weight: 'bold', color: primaryColor },
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderColor: accentColor,
          zIndex: 1,
        },
        {
          id: `el_headline_${Date.now()}_2`,
          type: 'headline',
          content: title,
          x: 40,
          y: 140,
          width: 460,
          height: 180,
          font: { family: 'Georgia', size: 36, weight: 'bold', color: '#0f172a' },
          align: 'left',
          style: {
            backgroundColor: `${accentColor}33`,
            borderRadius: '12px',
            padding: '16px',
            lineHeight: '1.25',
          },
          zIndex: 2,
        },
        {
          id: `el_text_${Date.now()}_3`,
          type: 'text',
          content: body,
          x: 40,
          y: 350,
          width: 460,
          height: 140,
          font: { family: 'Inter', size: 18, weight: '400', color: '#334155' },
          align: 'left',
          style: { lineHeight: '1.6' },
          zIndex: 3,
        }
      )
      if (visualDirective) {
        baseElements.push({
          id: `el_visual_${Date.now()}_4`,
          type: 'text',
          content: `💡 Directive: ${visualDirective}`,
          x: 40,
          y: 520,
          width: 460,
          height: 60,
          font: { family: 'monospace', size: 12, weight: '500', color: primaryColor },
          style: {
            backgroundColor: '#ffffffcc',
            borderLeft: `4px solid ${primaryColor}`,
            padding: '8px 12px',
            borderRadius: '4px',
          },
          zIndex: 4,
        })
      }
      break
    }

    case 'concept-explain': {
      baseElements.push(
        {
          id: `el_headline_${Date.now()}_1`,
          type: 'headline',
          content: title,
          x: 40,
          y: 60,
          width: 460,
          height: 70,
          font: { family: 'Georgia', size: 28, weight: 'bold', color: '#0f172a' },
          align: 'left',
          zIndex: 1,
        },
        {
          id: `el_img_${Date.now()}_2`,
          type: 'image',
          src: content.diagram || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
          x: 40,
          y: 145,
          width: 460,
          height: 220,
          borderRadius: 12,
          fit: 'cover',
          zIndex: 2,
        },
        {
          id: `el_body_${Date.now()}_3`,
          type: 'text',
          content: body,
          x: 40,
          y: 385,
          width: 460,
          height: 120,
          font: { family: 'Inter', size: 16, weight: '400', color: '#334155' },
          align: 'left',
          style: { lineHeight: '1.6' },
          zIndex: 3,
        }
      )
      if (content.insight) {
        baseElements.push({
          id: `el_insight_${Date.now()}_4`,
          type: 'badge',
          content: `Key Insight: ${content.insight}`,
          x: 40,
          y: 525,
          width: 460,
          height: 50,
          font: { family: 'Inter', size: 13, weight: 'bold', color: primaryColor },
          backgroundColor: `${accentColor}44`,
          borderColor: accentColor,
          zIndex: 4,
        })
      }
      break
    }

    case 'process-flow': {
      const steps = Array.isArray(content.steps)
        ? content.steps
        : body ? [body] : ['Step 1: Ingest input', 'Step 2: Process transformation', 'Step 3: Output result']
      baseElements.push({
        id: `el_headline_${Date.now()}_1`,
        type: 'headline',
        content: title,
        x: 40,
        y: 60,
        width: 460,
        height: 60,
        font: { family: 'Georgia', size: 28, weight: 'bold', color: '#0f172a' },
        align: 'left',
        zIndex: 1,
      })

      steps.forEach((step, idx) => {
        baseElements.push({
          id: `el_step_${Date.now()}_${idx + 2}`,
          type: 'text',
          content: `${idx + 1}. ${step}`,
          x: 40,
          y: 140 + idx * 110,
          width: 460,
          height: 90,
          font: { family: 'Inter', size: 15, weight: '500', color: '#1e293b' },
          align: 'left',
          style: {
            backgroundColor: '#ffffff',
            border: `1px solid ${accentColor}`,
            borderLeft: `5px solid ${primaryColor}`,
            borderRadius: '8px',
            padding: '14px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
          },
          zIndex: idx + 2,
        })
      })
      break
    }

    case 'comparison': {
      baseElements.push(
        {
          id: `el_headline_${Date.now()}_1`,
          type: 'headline',
          content: title,
          x: 40,
          y: 50,
          width: 460,
          height: 60,
          font: { family: 'Georgia', size: 28, weight: 'bold', color: '#0f172a' },
          align: 'center',
          zIndex: 1,
        },
        {
          id: `el_col_left_${Date.now()}_2`,
          type: 'text',
          content: `LEFT: ${content.leftTitle || 'Approach A'}\n\n${content.leftContent || body || 'Key characteristic'}`.trim(),
          x: 40,
          y: 130,
          width: 220,
          height: 380,
          font: { family: 'Inter', size: 14, weight: '400', color: '#991b1b' },
          align: 'left',
          style: {
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            padding: '16px',
          },
          zIndex: 2,
        },
        {
          id: `el_col_right_${Date.now()}_3`,
          type: 'text',
          content: `RIGHT: ${content.rightTitle || 'Approach B'}\n\n${content.rightContent || 'Optimized modern pattern'}`.trim(),
          x: 280,
          y: 130,
          width: 220,
          height: 380,
          font: { family: 'Inter', size: 14, weight: '400', color: '#166534' },
          align: 'left',
          style: {
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '16px',
          },
          zIndex: 3,
        }
      )
      break
    }

    case 'recap-close': {
      baseElements.push(
        {
          id: `el_headline_${Date.now()}_1`,
          type: 'headline',
          content: title || 'Quick Recap',
          x: 40,
          y: 60,
          width: 460,
          height: 60,
          font: { family: 'Georgia', size: 30, weight: 'bold', color: '#0f172a' },
          align: 'center',
          zIndex: 1,
        },
        {
          id: `el_recap_box_${Date.now()}_2`,
          type: 'text',
          content: `✅ Key Takeaways:\n\n${body || '1. Fundamental mechanics\n2. Practical architecture patterns\n3. Trade-offs and production constraints'}`,
          x: 40,
          y: 140,
          width: 460,
          height: 280,
          font: { family: 'Inter', size: 16, weight: '400', color: '#1e293b' },
          align: 'left',
          style: {
            backgroundColor: '#ffffff',
            border: `2px solid ${accentColor}`,
            borderRadius: '12px',
            padding: '24px',
            lineHeight: '1.7',
          },
          zIndex: 2,
        },
        {
          id: `el_cta_${Date.now()}_3`,
          type: 'badge',
          content: 'Save & Share with fellow engineers 📌',
          x: 90,
          y: 450,
          width: 360,
          height: 48,
          font: { family: 'Inter', size: 14, weight: 'bold', color: '#ffffff' },
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          zIndex: 3,
        }
      )
      break
    }

    case 'next-up': {
      baseElements.push(
        {
          id: `el_badge_${Date.now()}_1`,
          type: 'badge',
          content: 'SWE.NOTEBOOK ZERO TO HERO',
          x: 140,
          y: 80,
          width: 260,
          height: 36,
          font: { family: 'monospace', size: 12, weight: 'bold', color: primaryColor },
          backgroundColor: `${accentColor}33`,
          borderColor: accentColor,
          zIndex: 1,
        },
        {
          id: `el_headline_${Date.now()}_2`,
          type: 'headline',
          content: title || 'Up Next in the Series',
          x: 40,
          y: 150,
          width: 460,
          height: 120,
          font: { family: 'Georgia', size: 34, weight: 'bold', color: '#0f172a' },
          align: 'center',
          zIndex: 2,
        },
        {
          id: `el_body_${Date.now()}_3`,
          type: 'text',
          content: body || 'Follow along as we dive deeper into software systems and architecture.',
          x: 40,
          y: 300,
          width: 460,
          height: 100,
          font: { family: 'Inter', size: 18, weight: '400', color: '#475569' },
          align: 'center',
          zIndex: 3,
        },
        {
          id: `el_cta_${Date.now()}_4`,
          type: 'badge',
          content: 'Follow @swe.notebook for daily engineering blueprints 🚀',
          x: 60,
          y: 440,
          width: 420,
          height: 52,
          font: { family: 'Inter', size: 14, weight: 'bold', color: '#ffffff' },
          backgroundColor: primaryColor,
          borderColor: primaryColor,
          zIndex: 4,
        }
      )
      break
    }

    default: {
      baseElements.push(
        {
          id: `el_headline_${Date.now()}_1`,
          type: 'headline',
          content: title,
          x: 40,
          y: 60,
          width: 460,
          height: 70,
          font: { family: 'Georgia', size: 28, weight: 'bold', color: '#0f172a' },
          align: 'left',
          zIndex: 1,
        },
        {
          id: `el_body_${Date.now()}_2`,
          type: 'text',
          content: body,
          x: 40,
          y: 150,
          width: 460,
          height: 240,
          font: { family: 'Inter', size: 16, weight: '400', color: '#334155' },
          align: 'left',
          style: { lineHeight: '1.6' },
          zIndex: 2,
        }
      )
    }
  }

  return baseElements
}
