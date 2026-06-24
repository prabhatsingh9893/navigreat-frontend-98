import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { initSecurity } from './utils/security'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Initialize Client-side Security Controls
initSecurity();

ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
  <HashRouter>
    <ThemeProvider>
      {/* reducedMotion="user" makes all framer-motion animations respect the
          OS "reduce motion" setting (disables transforms, keeps opacity). */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </ThemeProvider>
  </HashRouter>
  //</React.StrictMode>,
)