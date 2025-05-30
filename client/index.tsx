import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import for createRoot
import App from './App';
// import './index.css'; // If you add a global CSS file for Tailwind directives with Vite

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
