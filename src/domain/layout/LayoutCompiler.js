/**
 * LayoutCompiler.js
 * Compiles layout specifications and content into structured slide element arrays.
 */

export function compileLayoutToElements({
  layoutId = 'concept-explain',
  content = {},
  collectionPalette = { primary: '#1E5FA8', accent: '#A9D0F5' },
  slideNo = 1,
  collectionName = '',
} = {}) {
  const elements = []

  if (layoutId === 'hook-open') {
    elements.push({
      id: `el_badge_${slideNo}`,
      type: 'badge',
      content: collectionName || 'CHAPTER COVER',
      fill: collectionPalette.primary || '#1E5FA8',
      accentColor: collectionPalette.accent || '#A9D0F5',
    })
    const headingText = content.heading || content.title || ''
    const bodyContent = content.bodyText || content.body || ''
    elements.push({
      id: `el_headline_${slideNo}`,
      type: 'headline',
      content: headingText,
      fill: collectionPalette.primary || '#1E5FA8',
      accentColor: collectionPalette.accent || '#A9D0F5',
    })
    elements.push({
      id: `el_text_${slideNo}`,
      type: 'text',
      content: bodyContent,
      fill: '#111827',
    })
  } else if (layoutId === 'comparison') {
    const headingText = content.heading || content.title || ''
    elements.push({
      id: `el_headline_${slideNo}`,
      type: 'headline',
      content: headingText,
      fill: collectionPalette.primary || '#1E5FA8',
    })
    elements.push({
      id: `el_col_left_${slideNo}`,
      type: 'container',
      title: content.leftTitle || '',
      content: `${content.leftTitle ? content.leftTitle + ': ' : ''}${content.leftContent || ''}`,
    })
    elements.push({
      id: `el_col_right_${slideNo}`,
      type: 'container',
      title: content.rightTitle || '',
      content: `${content.rightTitle ? content.rightTitle + ': ' : ''}${content.rightContent || ''}`,
    })
  } else {
    const headingText = content.heading || content.title || ''
    const bodyContent = content.bodyText || content.body || ''
    elements.push({
      id: `el_headline_${slideNo}`,
      type: 'headline',
      content: headingText,
      fill: collectionPalette.primary || '#1E5FA8',
    })
    if (bodyContent) {
      elements.push({
        id: `el_text_${slideNo}`,
        type: 'text',
        content: bodyContent,
      })
    }
  }

  return elements
}
