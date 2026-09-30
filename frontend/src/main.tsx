import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

async function enableMocking() {
  // The app talks to the real API; VITE_USE_MOCKS=true brings back the MSW mocks
  if (import.meta.env.VITE_USE_MOCKS !== 'true') return
  const { worker } = await import('./api/mocks/browser')
  return worker.start({ onUnhandledRequest: 'bypass' })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
