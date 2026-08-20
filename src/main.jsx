import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode is intentionally omitted: it double-invokes effects in dev,
// which terminates the Web Worker immediately after creation.
createRoot(document.getElementById('root')).render(<App />)
