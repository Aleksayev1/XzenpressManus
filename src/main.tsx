import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import * as serviceWorkerRegistration from './registerServiceWorker';

import { monitoring } from './services/monitoringService';

// Initialize monitoring (automatically setup on import)
console.log('Monitoring service initialized');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

// Register Service Worker for PWA functionality and Notifications
serviceWorkerRegistration.register();