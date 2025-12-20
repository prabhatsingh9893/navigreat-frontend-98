import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'

// Polyfill Globals for Zoom SDK (Required for v3.1.6)
import _ from 'lodash';
import * as Redux from 'redux';
window._ = _;
window.Redux = Redux;

ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
  //</React.StrictMode>,
)