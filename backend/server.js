/* eslint-disable no-unused-vars */
import * as Sentry from '@sentry/node'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import welcomeRouter from './routes/welcome-router.js';
import usersRouter from './routes/users-router.js';
import contentRouter from './routes/content-router.js';
import authRouter from './routes/auth-router.js';
import oauthRouter from './routes/oauth-router.js';
import healthRouter from './routes/health-router.js';
import passport from './config/passport.js';
import { sendErrorMessage } from './controllers/error-controllers.js';
import pinoHttp from 'pino-http'
import logger from './config/logger.js'
import { csrfProtection } from './custom-middleware/csrf-protection.js'


// SETTING UP THE SERVER
const app = express()
const PORT = process.env.PORT || 3000

// PROXY TRUST
// ─────────────────────────────────────────────────────────────────
// SECURITY ISSUE: IP Spoofing in rate limiting
//
// Our app runs behind a reverse proxy (Vercel/Render). Without this setting,
// Express sees the PROXY's IP address on every request instead of the real
// client's IP. That means rate-limiting would think all users share one IP
// and would throttle your entire app after the first few requests.
//
// Setting trust proxy: 1 tells Express to read the real IP from the
// X-Forwarded-For header that Vercel/Render adds. We only trust one hop (1)
// so an attacker can't spoof their IP by manually adding extra hops.
// ─────────────────────────────────────────────────────────────────
app.set('trust proxy', 1)


// HTTP SECURITY HEADERS — HELMET
// ─────────────────────────────────────────────────────────────────
// SECURITY ISSUES ADDRESSED:
//
//  • XSS (Cross-Site Scripting) — three variations, all addressed by Helmet's CSP:
//
//    - Stored XSS: attacker saves a malicious script to your database; it runs
//      in every other user's browser when they view that content.
//    - Reflected XSS: malicious script is embedded in a URL (e.g. a phishing link);
//      the server echoes it back in the HTML response and it runs on page load.
//    - DOM-based XSS: happens entirely in the browser — JS reads from the URL or
//      DOM and writes it unsafely back into the page (no server involved).
//
//    CSP is the backstop for all three: even if a malicious script tag somehow
//    made it into the page, the browser refuses to run it if it's not on the whitelist.
//    (See input-validators.js for the input-level defences against stored/reflected XSS,
//    and React's automatic escaping for DOM-based XSS.)
//
//  • Clickjacking: A malicious site embeds your app in a hidden <iframe>
//    and tricks users into clicking things. frame-ancestors: 'none' and
//    X-Frame-Options: DENY tell browsers to refuse to be framed.
//
//  • MIME Sniffing: Browsers sometimes guess a file's type even if the
//    server says otherwise. An attacker uploads a .txt file containing a
//    script, the browser runs it. noSniff: true tells browsers to trust
//    the Content-Type header and not guess.
//
//  • HTTPS Downgrade Attacks (HSTS): An attacker intercepts HTTP traffic
//    before the browser upgrades to HTTPS. Strict-Transport-Security tells
//    browsers to always use HTTPS for this domain, even if the user types http://.
//
// Helmet sets all of these headers automatically on every response.
// ─────────────────────────────────────────────────────────────────
import helmet from 'helmet'

app.use(helmet({

  // ── CONTENT SECURITY POLICY (CSP) ───────────────────────────────
  // CSP is a whitelist you send to the browser: "here are the ONLY places
  // this page is allowed to load things from." If a script/image/font isn't
  // on the list, the browser refuses to load it — even if an attacker managed
  // to inject a reference to their malicious server into your HTML.
  //
  // Think of it like a guest list at a venue: the bouncer (browser) only lets
  // in sources you've pre-approved. Anything else gets turned away at the door.
  //
  // Each directive below controls a different TYPE of resource:
  contentSecurityPolicy: {
    directives: {

      // default-src: the fallback rule for any resource type not listed below.
      // 'self' means "only from this exact domain" — no CDNs, no other sites.
      // If you don't explicitly set script-src, font-src, etc., they all fall
      // back to this. It's your safety net.
      "default-src": ["'self'"],

      // base-uri: controls what URLs are allowed in a <base> tag.
      // A <base> tag changes the base URL for all relative links on the page.
      // An attacker could inject one to redirect your links to their site.
      // 'self' restricts it to your own domain only.
      "base-uri": ["'self'"],

      // font-src: controls where fonts can be loaded from.
      // 'self' = only fonts served by your own server.
      // Note: 'data:' (inline base64 fonts) was removed — our app doesn't use any,
      // and allowing it was flagged as low-risk by pen testing.
      "font-src": ["'self'"],

      // frame-src: controls which URLs are allowed inside <iframe> tags on YOUR page.
      // reCAPTCHA v2 works by loading a Google iframe (the checkbox widget).
      // Without this, the browser would block the iframe and reCAPTCHA wouldn't appear.
      "frame-src": ["https://www.google.com"],

      // frame-ancestors: controls which sites are allowed to embed YOUR page in an iframe.
      // 'none' means NO site can put your app in an iframe — not even yourself.
      // This is the primary defense against CLICKJACKING: where an attacker overlays
      // your page in a transparent iframe and tricks users into clicking things
      // (e.g. "Like" buttons, transfer confirmations) without realizing it.
      // This is the modern, more powerful replacement for X-Frame-Options.
      "frame-ancestors": ["'none'"],

      // img-src: controls where images can be loaded from.
      // 'self' = your own server.
      // Note: 'data:' (inline base64 images) was removed — our app doesn't use any,
      // and allowing it was flagged as low-risk by pen testing.
      // gstatic.com = Google's static content server (reCAPTCHA loads images from here).
      "img-src": ["'self'", "https://www.gstatic.com"],

      // object-src: controls <object>, <embed>, and <applet> tags — old ways of
      // embedding Flash, Java applets, and plugins. These are essentially dead
      // technologies now, but they were historically a massive attack surface.
      // 'none' = block all of them entirely. There's no reason to allow them.
      "object-src": ["'none'"],

      // script-src: the most critical directive — controls which JavaScript is
      // allowed to run. This is your main XSS defense.
      // 'self' = only scripts from your own server.
      // google.com + gstatic.com = required for reCAPTCHA to load its JS.
      // Note: we do NOT include 'unsafe-inline' — that would allow <script> tags
      // injected directly into HTML, which is exactly what XSS attacks do.
      "script-src": ["'self'", "https://www.google.com", "https://www.gstatic.com"],

      // script-src-attr: controls inline event handlers like onclick="..." in HTML.
      // 'none' blocks all of them. Inline event handlers are a common XSS vector —
      // an attacker who can inject HTML might try onclick="stealCookies()".
      // Modern React doesn't use inline handlers anyway (it uses event listeners).
      "script-src-attr": ["'none'"],

      // style-src: controls where CSS stylesheets can be loaded from.
      // 'self' = only your own server. We don't include 'unsafe-inline' so
      // injected <style> tags (another XSS trick) won't work.
      "style-src": ["'self'"],

      // connect-src: controls where your JavaScript is allowed to make network
      // requests (fetch, XMLHttpRequest, WebSockets, EventSource).
      // 'self' = your own API.
      // google.com = needed for reCAPTCHA to send the token to Google's servers
      // to verify it. Without this, the reCAPTCHA verification step would be blocked.
      "connect-src": ["'self'", "https://www.google.com"],

      // media-src: controls <audio> and <video> sources.
      // 'self' = only media files from your own server. You don't use external
      // media, so no need to open this up further.
      "media-src": ["'self'"],

      // form-action: controls where HTML <form> submissions are allowed to go.
      // 'self' = forms can only POST to your own domain.
      // This prevents an attacker from injecting a form that submits the user's
      // data to a third-party server instead.
      "form-action": ["'self'"]
    },
  },

  // ── FRAMEGUARD (X-Frame-Options) ────────────────────────────────
  // The older way to prevent clickjacking (see frame-ancestors above).
  // frame-ancestors in CSP is more powerful, but X-Frame-Options is
  // kept as a fallback for older browsers that don't support CSP.
  // "deny" = nobody can embed this page in an iframe, period.
  frameguard: {
    action: "deny",
  },

  // ── NOSNIFF (X-Content-Type-Options) ────────────────────────────
  // Prevents "MIME sniffing" — where a browser ignores the Content-Type
  // header and tries to guess the file type itself.
  // Attack example: attacker uploads a file called photo.jpg that contains
  // JavaScript. The server says "Content-Type: image/jpeg" but the browser
  // notices it looks like JavaScript and runs it anyway.
  // noSniff: true tells the browser: "trust the Content-Type, never guess."
  noSniff: true,

  // ── HSTS (Strict-Transport-Security) ────────────────────────────
  // Tells browsers: "This site ALWAYS uses HTTPS. Never try HTTP, even
  // if the user types http:// or clicks an old http:// link."
  // Without HSTS, an attacker on the same network (coffee shop WiFi) could
  // intercept the initial HTTP request before it redirects to HTTPS
  // and steal session cookies — this is called an SSL-strip attack.
  //
  // maxAge: 31536000 = remember this rule for 1 year (in seconds)
  // includeSubDomains: apply the same rule to all subdomains
  // preload: opt into browsers' hardcoded HSTS list (the strongest form)
  //
  // We disable it in development because local dev runs on HTTP.
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,

}));


// ADDITIONAL CUSTOM SECURITY HEADERS
// ─────────────────────────────────────────────────────────────────
// SECURITY ISSUES ADDRESSED:
//
//  • X-XSS-Protection: Legacy browsers (IE, old Chrome) had a built-in XSS
//    filter that could sometimes be tricked into introducing vulnerabilities.
//    '1; mode=block' tells those browsers to block the page entirely if they
//    detect a reflected XSS attack instead of trying to sanitize it.
//    (Modern browsers use CSP instead — this is a fallback for older ones.)
//
//  • Referrer-Policy: When you click a link, browsers send a Referer header
//    to the new site showing where you came from. This can leak sensitive URL
//    parameters (like password-reset tokens). 'no-referrer' tells the browser
//    to send nothing.
//
//  • Permissions-Policy: Restricts which browser features this site is allowed
//    to use. Prevents a compromised script from quietly accessing the user's
//    camera, microphone, or location data.
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
// SECURITY ISSUE: Cross-origin data theft
//
// By default, browsers block JavaScript from reading responses from a
// different domain than the page it's running on (this is called the
// Same-Origin Policy). CORS is how a server opts INTO allowing specific
// cross-origin callers.
//
// We allow only our known frontend origin (e.g. http://localhost:5000 or
// your deployed Vercel URL). Any other site that tries to call our API will
// get blocked by the browser.
//
// credentials: true is required so that the browser will include our
// httpOnly auth cookies when making cross-origin API calls from the frontend.
// Without it, fetch('/api/...', { credentials: 'include' }) would fail silently.
// ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN
    ? process.env.ALLOWED_ORIGIN.split(',')
    : ['http://localhost:5000'],
  credentials: true  // required for cookies to be sent cross-origin
}))


// BODY PARSING
// ─────────────────────────────────────────────────────────────────
// Not a security layer itself, but required for the server to read
// incoming JSON request bodies (e.g. { username, password } on login).
// JSON arrives as a raw string — express.json() parses it into a JS object
// so our controllers can use req.body.username instead of parsing manually.
// ─────────────────────────────────────────────────────────────────
app.use(express.json())


// COOKIE PARSER
// ─────────────────────────────────────────────────────────────────
// Required to read incoming cookies from requests.
// Our JWT (token1) and UUID refresh token (token2) arrive as httpOnly cookies.
// cookieParser reads them and puts them on req.cookies so our middleware
// can verify them. Think of it like express.json() but for cookies.
// ─────────────────────────────────────────────────────────────────
app.use(cookieParser())


// CSRF PROTECTION
// ─────────────────────────────────────────────────────────────────
// SECURITY ISSUE: Cross-Site Request Forgery (CSRF)
//
// Because we store our auth tokens in cookies, those cookies are automatically
// sent by the browser on EVERY request to our domain — including requests
// triggered by a malicious third-party website.
//
// Example: a shady site auto-submits a form to /api/users/logout (or worse,
// a bank-style transfer endpoint). The browser attaches your cookies. The
// server thinks it's you. That's CSRF.
//
// Our defence has four layers — see csrf-protection.js for the full explanation:
//   1. sameSite: 'lax' on cookies (set in createJWT/createUUID)
//   2. Sec-Fetch-Site header check (server-side enforcement)
//   3. Origin header check (fallback for older browsers)
//   4. X-Requested-With custom header (our frontend always sends this;
//      attackers can't forge custom headers cross-site due to CORS preflight)
//
// This middleware only applies to state-changing methods: POST, PUT, DELETE, PATCH.
// ─────────────────────────────────────────────────────────────────
app.use('/api', csrfProtection)


// PASSPORT — OAUTH INITIALIZATION
// ─────────────────────────────────────────────────────────────────
// Not a security layer itself — this is the OAuth strategy manager.
// passport.initialize() sets up Passport so it can handle OAuth flows
// (Google, Facebook, Twitter login). The actual security happens inside
// each OAuth strategy (verifying tokens with the provider, PKCE for Twitter).
// ─────────────────────────────────────────────────────────────────
app.use(passport.initialize())


// LOGGING MIDDLEWARE
// ─────────────────────────────────────────────────────────────────
// SECURITY BENEFIT: Audit trail & incident detection
//
// Logging every request isn't just for debugging — it's a security tool.
// If someone is probing your app for vulnerabilities (e.g. trying many
// endpoints, odd payloads, repeated failed logins), logs let you see it.
// In production, logs go to Sentry/Pino where they can trigger alerts.
//
//  • morgan: logs each HTTP request in the terminal (dev = colorized,
//    production = Apache "combined" format with IP + user-agent)
//  • pino-http: structured JSON logging for Sentry and production log services
// ─────────────────────────────────────────────────────────────────
import morgan from 'morgan'

app.use(pinoHttp({ logger }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))       // concise, colorized output for development
} else {
  app.use(morgan('combined'))  // Apache format — includes IP, user-agent, referrer (better for analytics/security audits)
}


// RESPONSE COMPRESSION
// ─────────────────────────────────────────────────────────────────
// Not a security layer — this gzips response bodies to reduce bandwidth.
// Smaller responses = faster load times for users.
// ─────────────────────────────────────────────────────────────────
import compression from 'compression';

app.use(compression());


// PRODUCTION BUILD — SERVE REACT APP
// ─────────────────────────────────────────────────────────────────
// When deployed, Vercel/Render build the React app into /public.
// Express serves those static files directly so the browser gets
// the frontend without needing a separate Vite dev server.
// ─────────────────────────────────────────────────────────────────
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const publicPath = path.join(__dirname, '../public')
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
// All routes live under /api so they're clearly separated from static
// frontend files. Each router handles its own sub-routes internally.
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


// REACT SPA CATCH-ALL
// ─────────────────────────────────────────────────────────────────
// React Router handles navigation on the frontend. If a user hits a URL
// like /profile directly (page refresh or bookmark), the browser asks
// the server for that path — but Express doesn't have a /profile route.
// This catch-all sends back index.html for any non-API path, so React
// Router can take over and show the right page.
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
// SECURITY BENEFIT: Avoid leaking stack traces to users
//
// In production, never send raw error details (stack traces, file paths,
// database error messages) to the client — attackers can use them to map
// your system. Our error handlers catch all unhandled errors and return
// clean JSON responses instead.
//
// Order matters: Sentry must come before other error handlers so it can
// capture the full error before we send a response and close the request.
// ─────────────────────────────────────────────────────────────────

// Sentry error handler (captures errors and sends them to your Sentry dashboard)
Sentry.setupExpressErrorHandler(app)

// Sentry fallthrough handler (attaches a Sentry error ID to the response
// so users can quote it when reporting a problem)
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

import errorhandler from 'errorhandler'
import createError from 'http-errors'

// Development-only detailed error output (stack traces visible in terminal — never in production)
if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler())
}

// #1: Catch undefined routes — turns a "no route matched" into a proper 404 error object
app.use((req, res, next) => {
  next(createError(404));
});

// #2: Format error as JSON (our API should always return JSON, not an HTML error page)
app.use(sendErrorMessage);

// #3: Final catch-all — handles any error that slipped through the above handlers
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || '500: Internal Server Error';
  res.status(status).json({ message: message });
});


// START SERVER
app.listen(PORT, () => {
  if (!process.env.VERCEL) {
    console.log(`Server is running on http://localhost:${PORT}`)
  }
})

// EXPORT FOR VERCEL AND RENDER
export default app
