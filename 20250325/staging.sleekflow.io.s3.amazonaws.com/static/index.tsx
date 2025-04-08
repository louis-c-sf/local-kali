import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as Sentry from "@sentry/react";
import * as serviceWorker from "./serviceWorker";
// import { Integrations } from "@sentry/tracing";
import "./i18n";
import { matchPath } from "react-router";
import { createBrowserHistory } from "history";
import { flushRecords } from "utility/debug/actionsLoggerMiddleware";
import { URL } from "api/apiRequest";
import mixpanel from "mixpanel-browser";

Sentry.init({
  dsn: "https://154e0bbf636548c6a8d3513c66ecfc60@o983280.ingest.sentry.io/5938910",
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV5Instrumentation(
        createBrowserHistory,
        [], //todo extract routes from AppRoute
        matchPath
      ),
    }),
    new Sentry.Replay({
      networkDetailAllowUrls: [window.location.origin, URL],
    }),
  ],
  sampleRate: 0.25,
  environment: process.env.NODE_ENV,
  debug: process.env.NODE_ENV === "development",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.REACT_APP_SENTRY_SAMPLE_RATE
    ? parseFloat(process.env.REACT_APP_SENTRY_SAMPLE_RATE)
    : 1.0,
  tracePropagationTargets:
    process.env.NODE_ENV === "development" ? ["localhost"] : undefined,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend: (event) => {
    event.extra = { actions: flushRecords(20) };
    return event;
  },
});
mixpanel.init(process.env.REACT_APP_MIXPANEL_SECRET || "", {
  debug: false,
  track_pageview: process.env.REACT_APP_MIXPANEL_TRACK_PAGEVIEW === "true",
  persistence: "localStorage",
});
ReactDOM.render(<App />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
