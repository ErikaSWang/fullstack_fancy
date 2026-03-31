// Sentry (logging) initialization
// sentry.io for dashboard error tracking and performance monitoring

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  debug: process.env.NODE_ENV === 'development',

  // Send structured logs to Sentry
  enableLogs: true,
  // sendDefaultPii sends IP addresses and user identifiers to Sentry automatically.
  // Keeping this off to avoid sending user PII to a third-party service by default.
  // sendDefaultPii: true,
});