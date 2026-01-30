
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Global handler: ignore transient AbortError unhandled promise rejections
// coming from third-party libs (e.g., supabase-js) to avoid "Uncaught (in promise) AbortError"
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const reason = (event && (event as any).reason) || (event && (event as any).detail) || null;
  const msg = reason && (reason.message || String(reason));
  if (reason && (reason.name === 'AbortError' || /aborted/i.test(msg))) {
    console.info('Ignored aborted promise:', reason);
    event.preventDefault(); // prevent default logging to console
    return;
  }
  console.error('Unhandled promise rejection:', reason);
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
