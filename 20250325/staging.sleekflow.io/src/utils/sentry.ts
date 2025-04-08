import * as Sentry from '@sentry/react';
import React from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

export const setupSentry = () => {
  Sentry.init({
    environment: import.meta.env.VITE_SENTRY_ENV,
    dsn: 'https://465f4bc1cd4e491ebf7fa3a6c5ff3838@o983280.ingest.sentry.io/6647583',
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
        beforeStartSpan: (context) => ({
          ...context,
          // '/en/inbox' -> '/:locale/inbox'
          // '/en-HK/inbox' -> '/:locale/inbox'
          // '/inbox' -> '/inbox'
          name: location.pathname.replace(/\/[a-z]{2}(-[A-Z]{2})?/, '/:locale'),
        }),
      }),
      Sentry.captureConsoleIntegration({
        levels: ['error'],
      }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        maskAllInputs: false,
      }),
    ],
    attachStacktrace: true,
    // Sample rate is set to 1.0 to pass all errors to beforeSend for granular sampling
    sampleRate: 1,
    beforeSend(event) {
      if (event.tags?.bypass_sampling) {
        return event;
      }
      return Math.random() < Number(import.meta.env.VITE_SENTRY_SAMPLE_RATE)
        ? event
        : null;
    },
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: import.meta.env.VITE_SENTRY_REPLAY_SAMPLE_RATE,
    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: import.meta.env
      .VITE_SENTRY_ERROR_REPLAY_SAMPLE_RATE,

    tracePropagationTargets: [],
    allowUrls: [
      'dev.sleekflow.io',
      'staging.sleekflow.io',
      'perf-revamp.sleekflow.io',
      'app.sleekflow.io',
    ],
  });
};
