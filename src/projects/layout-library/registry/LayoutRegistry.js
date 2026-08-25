/**
 * LayoutRegistry.js
 * ─────────────────
 * Central registry mapping Layout Archetype IDs to their component, metadata,
 * default configuration, and slot schemas.
 */

import HookOpen from './archetypes/HookOpen'
import ConceptExplain from './archetypes/ConceptExplain'
import ProcessFlow from './archetypes/ProcessFlow'
import Comparison from './archetypes/Comparison'
import RecapClose from './archetypes/RecapClose'
import NextUp from './archetypes/NextUp'
import TimelineRibbon from './archetypes/TimelineRibbon'
import ArchitectureBlueprint from './archetypes/ArchitectureBlueprint'
import MatrixReplace from './archetypes/MatrixReplace'

export const LAYOUT_REGISTRY = {
  'hook-open': {
    id: 'hook-open',
    name: 'Hook / Open',
    icon: '🎯',
    description: 'High-impact asymmetric title with highlighter accent block and topic watermark.',
    component: HookOpen,
    defaultConfig: {
      titlePosition: 'center',
      showWatermark: true,
      watermarkOpacity: 0.08,
    },
    slotSchema: {
      title: { type: 'text', required: true, label: 'Title' },
      content: { type: 'text', required: true, label: 'Content' },
      visualDirective: { type: 'text', required: false, label: 'Visual Directive' },
      watermark: { type: 'text', required: false, label: 'Watermark Text' },
    },
  },

  'concept-explain': {
    id: 'concept-explain',
    name: 'Concept / Explain',
    icon: '📖',
    description: 'Split container with dedicated technical diagram and structured insight card.',
    component: ConceptExplain,
    defaultConfig: {
      showDiagram: true,
      diagramPosition: 'left',
      insightCard: true,
    },
    slotSchema: {
      title: { type: 'text', required: true, label: 'Title' },
      content: { type: 'text', required: true, label: 'Explanation' },
      diagram: { type: 'image', required: false, label: 'Diagram Image' },
      insight: { type: 'text', required: false, label: 'Key Insight' },
    },
  },

  'process-flow': {
    id: 'process-flow',
    name: 'Process / Flow',
    icon: '🔄',
    description: '3-stage directional workflow with numbered badge pills and connecting arrows.',
    component: ProcessFlow,
    defaultConfig: {
      steps: 3,
      showArrows: true,
      orientation: 'horizontal',
    },
    slotSchema: {
      title: { type: 'text', required: true, label: 'Title' },
      steps: { type: 'array', required: true, label: 'Process Steps' },
      content: { type: 'text', required: false, label: 'Description' },
    },
  },

  'comparison': {
    id: 'comparison',
    name: 'Comparison',
    icon: '⚖️',
    description: 'Split screen 50/50 comparison contrasting two distinct approaches.',
    component: Comparison,
    defaultConfig: {
      split: 50,
      leftColor: '#fef2f2',
      rightColor: '#f0fdf4',
    },
    slotSchema: {
      title: { type: 'text', required: true, label: 'Title' },
      leftTitle: { type: 'text', required: false, label: 'Left Title' },
      leftContent: { type: 'text', required: false, label: 'Left Content' },
      rightTitle: { type: 'text', required: false, label: 'Right Title' },
      rightContent: { type: 'text', required: false, label: 'Right Content' },
    },
  },

  'recap-close': {
    id: 'recap-close',
    name: 'Recap / Close',
    icon: '✅',
    description: 'Checklist-style summary with key takeaways and next steps.',
    component: RecapClose,
    defaultConfig: {
      showNextUp: true,
    },
    slotSchema: {
      title: { type: 'text', required: true, label: 'Title' },
      items: { type: 'array', required: false, label: 'Recap Items' },
      nextUp: { type: 'text', required: false, label: 'Next Up Text' },
    },
  },

  'next-up': {
    id: 'next-up',
    name: 'Next Up',
    icon: '🔮',
    description: 'Final slide with upcoming topic and brand CTA.',
    component: NextUp,
    defaultConfig: {
      showLogo: true,
      showCTA: true,
    },
    slotSchema: {
      title: { type: 'text', required: true, label: 'Next Up Title' },
      content: { type: 'text', required: true, label: 'Description' },
    },
  },

  'timeline-ribbon': {
    id: 'timeline-ribbon',
    name: 'Timeline Ribbon',
    icon: '📅',
    description: 'Continuous chronological milestone line with events.',
    component: TimelineRibbon,
    defaultConfig: {
      orientation: 'horizontal',
      showDates: true,
    },
    slotSchema: {
      title: { type: 'text', required: true, label: 'Title' },
      events: { type: 'array', required: true, label: 'Timeline Events' },
    },
  },

  'architecture-blueprint': {
    id: 'architecture-blueprint',
    name: 'Architecture Blueprint',
    icon: '🏗️',
    description: 'Clean system design nodes with directional request/response flow.',
    component: ArchitectureBlueprint,
    defaultConfig: {
      showFlow: true,
    },
    slotSchema: {
      title: { type: 'text', required: true, label: 'Title' },
      nodes: { type: 'array', required: true, label: 'Architecture Nodes' },
      flow: { type: 'text', required: false, label: 'Flow Description' },
    },
  },

  'matrix-replace': {
    id: 'matrix-replace',
    name: 'Matrix Replace',
    icon: '🔄',
    description: '2-column role-to-AI replacement matrix with arrows and official logos.',
    component: MatrixReplace,
    defaultConfig: {
      showLogos: true,
    },
    slotSchema: {
      title: { type: 'text', required: true, label: 'Title' },
      replacements: { type: 'array', required: true, label: 'Replacement Matrix' },
    },
  },
}

/** Get a layout entry by ID */
export function getLayout(id) {
  return LAYOUT_REGISTRY[id] || null
}

/** Get all layout options for dropdown/selection */
export function getLayoutOptions() {
  return Object.values(LAYOUT_REGISTRY).map(({ id, name, icon, description, slotSchema }) => ({
    value: id,
    label: `${icon} ${name}`,
    description,
    slotCount: slotSchema ? Object.keys(slotSchema).length : 0,
  }))
}

export default LAYOUT_REGISTRY
