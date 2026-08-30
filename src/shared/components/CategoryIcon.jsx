import {
  Target,
  BookOpen,
  Workflow,
  Scale,
  Terminal,
  CheckCircle2,
  Rocket,
  Award,
  Calendar,
  Layers,
  RefreshCw,
  Folder,
  Layout,
  Palette,
  Camera,
  FileText,
  Sparkles,
  Zap,
  Box,
} from 'lucide-react'

const ICON_MAP = {
  // Named keys
  target: Target,
  'book-open': BookOpen,
  workflow: Workflow,
  scale: Scale,
  terminal: Terminal,
  'check-circle': CheckCircle2,
  rocket: Rocket,
  award: Award,
  calendar: Calendar,
  layers: Layers,
  'refresh-cw': RefreshCw,
  folder: Folder,
  layout: Layout,
  palette: Palette,
  camera: Camera,
  'file-text': FileText,
  sparkles: Sparkles,
  zap: Zap,
  box: Box,

  // LayoutCategory key mapping
  'hook-open': Target,
  'concept-explain': BookOpen,
  'process-flow': Workflow,
  comparison: Scale,
  'real-world': Terminal,
  'recap-close': CheckCircle2,
  'series-finale': Rocket,

  // Emoji mapping fallbacks
  '🎯': Target,
  '📖': BookOpen,
  '🔄': Workflow,
  '⚖️': Scale,
  '📟': Terminal,
  '✅': CheckCircle2,
  '🏵️': Award,
  '🔮': Sparkles,
  '📅': Calendar,
  '🏗️': Layers,
  '⚡': Zap,
  '📁': Folder,
  '🎨': Palette,
  '📐': Layout,
  '📸': Camera,
  '💡': Sparkles,
  '🚀': Sparkles,
  '📊': Layers,
  '🏷️': FileText,
  '💎': Sparkles,
  '⚙️': Box,
}

export default function CategoryIcon({ name, icon, className = 'w-5 h-5', fallback = Folder }) {
  const key = (name || icon || '').toLowerCase().trim()
  const IconComponent = ICON_MAP[key] || ICON_MAP[icon] || fallback

  return <IconComponent className={className} />
}
