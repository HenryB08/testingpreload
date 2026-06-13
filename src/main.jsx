import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// No StrictMode: it double-invokes effects in dev, which would run the GSAP
// reveal timeline and the Lenis init twice. The preloader is animation-driven,
// so we keep a single, deterministic mount.
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
