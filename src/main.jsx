import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './shared/styles/index.css'
import router from './router'
import { runPersistenceMigrations } from './infrastructure/persistence/migrationService'

// Trigger automatic persistence migrations (IndexedDB & Schema V1.0.0)
runPersistenceMigrations().catch((err) => {
  console.warn('[Bootstrap] Persistence migration warning:', err)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
