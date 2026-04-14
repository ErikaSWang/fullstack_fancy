// EXTERNAL LOGGING PACKAGE (supposed to come first, before even Express)
import * as Sentry from '@sentry/node'

// BACKEND FRAMEWORK (for creating a server that can handle API requests, connect to a database, etc.)
// (defines routes, handles authentication, processes data for the frontend)
import express from 'express'

// MIDDLEWARE (packages that help with security, logging, etc)
// Used in a particular order, as needed:
// SECURITY:
import helmet from 'helmet'                   // sets secure HTTP headers
import cors from 'cors'                       // configures CORS for cross-origin requests
import cookieParser from 'cookie-parser'      // parses cookies from incoming requests
    // THIS IS OUR CUSTOM MIDDLEWARE FOR CSRF (the CSRF package is deprecated)
import { csrfProtection } from './custom-middleware/csrf-protection.js'  // custom CSRF protection middleware (enforces sameSite, Sec-Fetch-Site, Origin, and custom header checks)
import passport from './config/passport.js';  // manages OAuth strategies (Google, Facebook, Twitter login)
// LOGGING:
import logger from './config/logger.js'       // structured logging with Pino (sends logs to Sentry and production log services)
import pinoHttp from 'pino-http'              // Express middleware for Pino logging (logs each HTTP request in JSON format for Sentry/production logs)
import morgan from 'morgan'                   // HTTP request logger (colorized for development, Apache format for production) 
// UTILITIES:
import compression from 'compression';        // gzips response bodies to reduce bandwidth (not a security layer, but improves performance)
import path from 'path'                       // for working with file and directory paths (serving React in production) 
import { fileURLToPath } from 'url'           // for getting __dirname in ES modules (serving React in production)
import fs from 'fs'                           // for checking if the React build folder exists (serving React in production) 
// ERROR HANDLING:
import errorhandler from 'errorhandler'       // development-only error handler that shows stack traces in the terminal (never used in production)
import createError from 'http-errors'         // for creating HTTP error objects (e.g. 404 Not Found) in our error handlers
// ADDITIONAL MIDDLWARE used below that didn't need imports:
    // our custom headers
    // .json() body parser
    // our custom CSRF protection
  

// ROUTES PLACED IN SEPARATE FILES TO HELP KEEP THINGS ORGANIZED
import welcomeRouter from './routes/welcome-router.js';
import usersRouter from './routes/users-router.js';
import contentRouter from './routes/content-router.js';
import authRouter from './routes/auth-router.js';
import oauthRouter from './routes/oauth-router.js';
import healthRouter from './routes/health-router.js';


// SETTING UP THE SERVER
const app = express()
const PORT = process.env.PORT || 3000


// GAUNTLET OF MIDDLWARE (there are LOTS!). For:
    // 1. Security hardening (headers, CORS, CSRF)
          // a) Trust proxy - needed for (correct IP logging and rate limiting, for) Vercel/Replit deployments
          // a) ADDING HEADERS TO NARROW KNOWN VULNERABILITIES:
                // i. Helmet - addresses CSP, clickjacking, MIME sniffing, HSTS
                // ii. Custom headers - addresses legacy XSS protection, referrer policy, permissions policy
          // b) IP ADDRESS NARROWING:
                // CORS - set to allow only our frontend origin
          // d) CUSTOM CSRF PROTECTION

                // NEED TO TAKE A CLOSER LOOK AT THIS
                // NOT SURE WHAT CLAUDE PUT TOGETHER

                // middleware that enforces sameSite, Sec-Fetch-Site, Origin, and custom header checks
    
    // 2. Logging (audit trail & incident detection)
          // a) Pino - needed for Sentry? (CAN HAVE AS MUCH OR AS LITTLE AS YOU CHOOSE)
          // b) Morgan - all the details of each HTTP request (method, path, status code, response time) in the terminal for development; Apache format (with IP and user-agent) for production (can be used for security audits and detecting suspicious activity)
    // 3. Speed/Performance
          // a) compression - gzips response bodies to reduce bandwidth
    // 4. Utilities needed to interact with file system, so the frontend can be built for production
          // a) path
          // b) fileURLToPath
          // c) fs 
    // 5. Error handling (Sentry + custom handlers)
          // a) Sentry error handler - captures errors and sends them to your Sentry dashboard
          // b) Sentry fallthrough handler - attaches a Sentry error ID to the response so users can quote it when reporting a problem
          // c) Development-only detailed error output (listed in the terminal)
          // d) Catch undefined routes — turns a "no route matched" into a proper 404 error object
          // e) Final catch-all — handles any error that slipped through the above handlers and returns a clean JSON response without stack traces (to avoid


// PROXY TRUST
// ─────────────────────────────────────────────────────────────────
// Our app runs behind a reverse proxy (Vercel/Render), so Express sees the
// proxy's IP instead of the real client's. Without this, rate limiting would
// think every user shares the same IP. trust proxy: 1 tells Express to read
// the real IP from the X-Forwarded-For header (one hop only — prevents spoofing).
// ─────────────────────────────────────────────────────────────────
app.set('trust proxy', 1)


// HTTP SECURITY HEADERS — HELMET
// (CONTENT SECURITY POLICY, FRAMEGUARD, NOSNIFF, HSTS)
// ─────────────────────────────────────────────────────────────────
// Helmet auto-sets headers on every response to address four attack types:
//  • XSS (all three kinds) — CSP tells the browser which sources it may load;
//    injected scripts from anywhere else get refused. (Input sanitization in
//    input-validators.js and React's auto-escaping add more layers.)
//  • Clickjacking — frame-ancestors: 'none' prevents your app from being
//    embedded in a hidden iframe on a malicious site.
//  • MIME Sniffing — noSniff stops browsers from running a file as JS
//    just because it looks like JS (e.g. an "image" upload that's actually a script).
//  • HTTPS Downgrade (SSL-strip) — HSTS tells browsers to always use HTTPS,
//    so an attacker on public Wi-Fi can't intercept the initial HTTP request.
// ─────────────────────────────────────────────────────────────────


app.use(helmet({

  // ── CONTENT SECURITY POLICY (CSP) ───────────────────────────────
  // A whitelist sent to the browser: "only load resources from these sources."
  // Even if an attacker injects a <script> tag pointing to their server,
  // the browser refuses to run it. Each directive controls a resource type:
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],                                          // fallback for any type not listed below
      "base-uri":    ["'self'"],                                          // prevents injected <base> tags from hijacking relative links
      "font-src":    ["'self'"],                                          // fonts from our server only
      "frame-src":   ["https://www.google.com"],                         // reCAPTCHA v2 loads in a Google iframe
      "frame-ancestors": ["'none'"],                                      // no site may embed our app in an iframe (clickjacking defense)
      "img-src":     ["'self'", "https://www.gstatic.com"],              // gstatic = Google's static server (reCAPTCHA images)
      "object-src":  ["'none'"],                                          // blocks Flash/Java applets — dead tech, huge attack surface
      "script-src":  ["'self'", "https://www.google.com", "https://www.gstatic.com"],  // no 'unsafe-inline' — that's exactly what XSS injects
      "script-src-attr": ["'none'"],                                      // blocks inline onclick="..." handlers (common XSS vector)
      "style-src":   ["'self'"],                                          // no 'unsafe-inline' — blocks injected <style> tags
      "connect-src": ["'self'", "https://www.google.com"],               // google.com needed for reCAPTCHA token verification
      "media-src":   ["'self'"],                                          // audio/video from our server only
      "form-action": ["'self'"]                                           // forms may only POST to our own domain
    },
  },

  // ── FRAMEGUARD (X-Frame-Options) ────────────────────────────────
  // Older fallback for browsers that don't support CSP's frame-ancestors.
  frameguard: { action: "deny" },

  // ── NOSNIFF (X-Content-Type-Options) ────────────────────────────
  // Stops browsers from guessing file types — e.g. running a "photo.jpg"
  // that's actually JavaScript because it looks like JS.
  noSniff: true,

  // ── HSTS (Strict-Transport-Security) ────────────────────────────
  // Forces HTTPS always. Without it, an attacker on public Wi-Fi can
  // intercept the initial HTTP request before the browser upgrades (SSL-strip).
  // Disabled in development since local dev runs on HTTP.
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,

}));


// ADDITIONAL CUSTOM SECURITY HEADERS
// ─────────────────────────────────────────────────────────────────
//  • X-XSS-Protection: Legacy fallback for old browsers without CSP support.
//    Tells them to block the page if they detect a reflected XSS attack.
//  • Referrer-Policy: Stops browsers from sending the Referer header when
//    you navigate away — prevents leaking sensitive URL params (e.g. reset tokens).
//  • Permissions-Policy: Restricts browser features. Prevents a compromised
//    script from silently accessing the camera, mic, or location.
// ─────────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.set({
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=()'
  });
  next();
});


// CORS — CROSS-ORIGIN RESOURCE SHARING
// ─────────────────────────────────────────────────────────────────
// Browsers block JS from reading responses from a different domain by default
// (Same-Origin Policy). CORS lets our server opt INTO allowing our frontend.
// Only our known origin is whitelisted — any other caller gets blocked.
// credentials: true is required so the browser includes our httpOnly cookies
// on cross-origin API calls (fetch with { credentials: 'include' }).
// ─────────────────────────────────────────────────────────────────


app.use(cors({
  origin: process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(',')
    : ['http://localhost:5000'],
  credentials: true,  // required for cookies to be sent cross-origin
  maxAge: 86400       // cache preflight response for 24 hours — browser won't re-send OPTIONS before every request
}))


// BODY PARSING
// ─────────────────────────────────────────────────────────────────
// Parses incoming JSON request bodies into req.body (e.g. { username, password }).
// JSON arrives as a raw string — this turns it into a JS object our routes can use.
// ─────────────────────────────────────────────────────────────────
app.use(express.json())


// COOKIE PARSER
// ─────────────────────────────────────────────────────────────────
// Reads incoming cookies into req.cookies — same idea as express.json() but for cookies.
// Our JWT (token1) and UUID refresh token (token2) arrive as httpOnly cookies.
// ─────────────────────────────────────────────────────────────────
app.use(cookieParser())


// CSRF PROTECTION
// ─────────────────────────────────────────────────────────────────
// Because cookies are sent automatically on every request to our domain,
// a malicious site could trigger requests (e.g. a form POST to /api/logout)
// that our server mistakes for the real user. That's CSRF.
// Four-layer defence — see csrf-protection.js for the full explanation:
//   1. sameSite: 'lax' on cookies
//   2. Sec-Fetch-Site header check
//   3. Origin header check (older browser fallback)
//   4. X-Requested-With custom header (attackers can't forge custom headers cross-site)
// Applies to state-changing methods only: POST, PUT, DELETE, PATCH.
// ─────────────────────────────────────────────────────────────────
app.use('/api', csrfProtection)


// PASSPORT — OAUTH INITIALIZATION
// ─────────────────────────────────────────────────────────────────
// Initializes Passport so it can handle OAuth flows (Google, Facebook, Twitter).
// The actual token verification + PKCE security lives inside each strategy file.
// ─────────────────────────────────────────────────────────────────
app.use(passport.initialize())


// LOGGING MIDDLEWARE
// ─────────────────────────────────────────────────────────────────
// Logs every request — useful for debugging AND for spotting suspicious
// patterns (repeated failed logins, endpoint probing, odd payloads).
//  • pino-http: structured JSON logging → Sentry and production log services
//  • morgan: human-readable terminal output (colorized in dev, Apache format in prod)
// ─────────────────────────────────────────────────────────────────
//app.use(pinoHttp({ logger }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))       // concise, colorized output for development
} else {
  //app.use(morgan('combined'))  // Apache format — includes IP, user-agent, referrer (better for analytics/security audits)
}


// RESPONSE COMPRESSION
// ─────────────────────────────────────────────────────────────────
// Gzips response bodies to reduce bandwidth and improve load times.
// ─────────────────────────────────────────────────────────────────
app.use(compression());


// PRODUCTION BUILD — SERVE REACT APP
// ─────────────────────────────────────────────────────────────────
// In production, Vercel/Render build the React app into /public.
// Express serves those static files so no separate Vite dev server is needed.
// ─────────────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicPath = path.join(__dirname, '../frontend/dist')
const serveReactApp = fs.existsSync(publicPath)

if (serveReactApp) {
  app.use(express.static(publicPath))
}


// SENTRY TEST ROUTE — uncomment to trigger a test error at /api/debug-sentry
// app.get("/api/debug-sentry", function mainHandler(req, res) {
//   throw new Error("My first Sentry error!");
// });


// ROUTES
// ─────────────────────────────────────────────────────────────────
// All routes under /api, cleanly separated from static frontend files.
// ─────────────────────────────────────────────────────────────────
app.use('/api', welcomeRouter);
app.use('/api', usersRouter);
app.use('/api', contentRouter);
app.use('/api', authRouter);
app.use('/api', oauthRouter);
app.use('/api', healthRouter);


// SIMPLE HELLO ROUTE
// (kept here as an example of a direct route with caching)
app.get('/api/hello', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60')  // tell browsers to cache this for 60s — it's the same for every user
  res.status(200).json({ message: 'Hello from the backend!' })
});


// ERROR CATCH-ALL
// ─────────────────────────────────────────────────────────────────
// If a user refreshes /profile, the browser asks Express for that path —
// but there's no Express route for it. This catch-all returns index.html
// so React Router can take over and show the right page.
// ─────────────────────────────────────────────────────────────────
if (serveReactApp) {
  app.get('/{*path}', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next()  // don't intercept API routes — let them fall through to error handlers
    }
    res.sendFile(path.join(publicPath, 'index.html'))
  })
}


// ERROR HANDLERS
// ─────────────────────────────────────────────────────────────────
// Never send raw stack traces to clients in production — attackers can use
// them to map your system. Our handlers catch all unhandled errors and return
// clean JSON instead. Order matters: Sentry captures first, then we respond.
// ─────────────────────────────────────────────────────────────────

// Sentry error handler (captures errors and sends them to your Sentry dashboard)
Sentry.setupExpressErrorHandler(app)

// Sentry fallthrough handler (attaches a Sentry error ID to the response
// so users can quote it when reporting a problem)
app.use(function onError(err, req, res) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});


// Development-only detailed error output (stack traces visible in terminal — never in production)
if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler())
}

// #2: Catch undefined routes — turns a "no route matched" into a proper 404 error object
app.use((req, res, next) => {
  next(createError(404));
});

// #3: Final catch-all — handles any error that slipped through the above handlers
app.use((err, req, res) => {
  const status = err.status || 500;
  const message = err.message || '500: Internal Server Error';
  res.status(status).json({ message: message });
});


// START SERVER
// In Vercel's serverless environment, the app is exported and Vercel handles
// the HTTP listening itself — calling listen() is not needed and may error.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
}

// EXPORT FOR VERCEL AND RENDER
export default app
