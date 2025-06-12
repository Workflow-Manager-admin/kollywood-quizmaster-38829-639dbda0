import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// If PUBLIC_URL is meant to be used, define fallback (for create-react-app deployments).
if (typeof process.env.PUBLIC_URL === "undefined") {
  process.env.PUBLIC_URL = "";
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
