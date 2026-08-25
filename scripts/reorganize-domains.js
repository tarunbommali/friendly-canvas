import fs from 'fs'
import path from 'path'

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dest, { recursive: true })
  const entries = fs.readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

// 1. Copy track-content -> library
copyDirRecursive(path.resolve('src/projects/track-content'), path.resolve('src/projects/library'))

// 2. Copy carousel-editor -> design-studio
copyDirRecursive(path.resolve('src/projects/carousel-editor'), path.resolve('src/projects/design-studio'))

// 3. Copy layout-library -> templates
copyDirRecursive(path.resolve('src/projects/layout-library'), path.resolve('src/projects/templates'))

console.log('Reorganization directory copy complete!')
