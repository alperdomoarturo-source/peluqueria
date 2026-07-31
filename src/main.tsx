import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Verify JavaScript is executing
const rootDiv = document.getElementById('root')
if (rootDiv) {
  rootDiv.innerHTML = 'JavaScript ejecutándose...'
}

// Global error handler with visible display
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  const errorDiv = document.getElementById('error-display')
  if (errorDiv) {
    errorDiv.innerHTML = `Error: ${event.error?.message || event.error}`
    errorDiv.style.display = 'block'
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  const errorDiv = document.getElementById('error-display')
  if (errorDiv) {
    errorDiv.innerHTML = `Error: ${event.reason?.message || event.reason}`
    errorDiv.style.display = 'block'
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
