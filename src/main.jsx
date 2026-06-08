import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter } from 'react-router-dom'
import { initSecurity } from './utils/security'

// Initialize Client-side Security Controls
initSecurity();

ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
  <HashRouter>
    <App />
  </HashRouter>
  //</React.StrictMode>,
)