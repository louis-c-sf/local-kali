/* eslint-disable @typescript-eslint/no-empty-function */
import { LicenseInfo } from '@mui/x-license';
import mixpanel from 'mixpanel-browser';
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'reflect-metadata';

import AppRoutes from '@/AppRoutes';
import { setupAppInsights } from '@/utils/applicationInsights';
import { setupSentry } from '@/utils/sentry';

import './i18n';
import workerManager from './workers/workerManager';

setupSentry();
setupAppInsights();

LicenseInfo.setLicenseKey(
  '489b9796eb757b764f0c29860f046845Tz0xMTAyMDcsRT0xNzc0NDgzMTk5MDAwLFM9cHJvLExNPXN1YnNjcmlwdGlvbixQVj1pbml0aWFsLEtWPTI=',
);

// Disable console logs on production
if (import.meta.env.VITE_USER_NODE_ENV === 'production') {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
  console.warn = () => {};
  // Don't override in order to capture the error from console then send to sentry
  // console.error = () => {};
}

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN, {
  debug: false,
  persistence: 'localStorage',
});

// Terminate the worker when the browser tab is closed
window.addEventListener('beforeunload', () => {
  workerManager.terminate();
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>,
);
