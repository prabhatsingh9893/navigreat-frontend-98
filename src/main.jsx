import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter } from 'react-router-dom'

// Polyfill Globals for Zoom SDK (Required for v3.1.6+)
// Not needed for 2.18.0 as we use CDN
// import _ from 'lodash';
// import * as Redux from 'redux';
// import { Buffer } from 'buffer';

// window.global = window;
// window.process = { env: { NODE_ENV: 'development' }, browser: true };
// window.Buffer = Buffer;
// window._ = _;
// window.Redux = Redux;

ReactDOM.createRoot(document.getElementById('root')).render(
  //<React.StrictMode>
  <HashRouter>
    <App />
  </HashRouter>
  //</React.StrictMode>,
)