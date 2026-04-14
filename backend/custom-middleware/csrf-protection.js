// ============================================================
// CSRF PROTECTION MIDDLEWARE
// ============================================================
//
// THE THREAT: CSRF (Cross-Site Request Forgery)
//
// Imagine you're logged into your bank. You visit a shady website
// in another tab. That site has a hidden form that auto-submits a
// POST request to your bank's transfer endpoint. Your browser
// automatically attaches your bank's auth cookie to the request —
// the bank's server can't tell the difference between YOU clicking
// "transfer" and the attacker's page doing it for you.
//
// That's CSRF. The attack works because:
//   1. You're using cookie-based auth (cookies attach automatically)
//   2. The server can't tell if the request came from your app or an attacker's page
//
// HOW WE DEFEND (three layers — each one catches what the previous misses):
//
//   Layer 1 — sameSite: 'lax' on your cookies (already set in createJWT/createUUID)
//     → Tells the browser: "only attach this cookie on same-site requests"
//     → Stops most CSRF cold. But it's the browser enforcing it, not your server.
//
//   Layer 2 — Sec-Fetch-Site header (this file, Check 1)
//     → Modern browsers always include this header. It says WHERE the request came from.
//     → Your server can reject it directly if the value is 'cross-site'.
//     → This is server-side enforcement of the same rule as sameSite.
//
//   Layer 3 — Origin header (this file, Check 2)
//     → Older fallback. Not all browsers send Sec-Fetch-Site, but most send Origin.
//     → We verify it matches our known frontend address.
//
//   Layer 4 — X-Requested-With custom header (this file, Check 3)
//     → Our React app adds this header to every state-changing fetch() call.
//     → Browsers require a CORS "preflight" before allowing custom headers cross-site.
//     → Our CORS config only allows our frontend origin — so an attacker's site
//       can't pass preflight and can't forge this header. No header = not our app.
//
// NOTE: We only apply these checks to state-changing HTTP methods (POST, PUT, DELETE, PATCH).
// GET requests are read-only and can't (shouldn't) cause side effects, so they're excluded.
// ============================================================


// Parse ALLOWED_ORIGIN the same way server.js does — supports comma-separated list
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:5000']

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH'])


export function csrfProtection(req, res, next) {

  // Only check state-changing requests — GET/HEAD are safe, skip them
  if (!STATE_CHANGING_METHODS.has(req.method)) return next()


  // CHECK 1: Sec-Fetch-Site header
  // Modern browsers (Chrome, Firefox, Safari, Edge) always send this.
  // 'cross-site'  = request came from a completely different website → BLOCK
  // 'same-origin' = request came from the exact same origin → ALLOW
  // 'same-site'   = request came from a subdomain of our site → ALLOW
  // 'none'        = direct navigation (curl, Postman, etc.) → ALLOW
  //                 (not a browser CSRF attack — no cookies in that context)
  //
  // Attack example — what the browser sends when evil.com auto-submits a form:
  //   POST /api/users/delete-account HTTP/1.1
  //   Host: yoursite.com
  //   Cookie: token1=eyJhbGc...   ← browser auto-attached the auth cookie
  //   Sec-Fetch-Site: cross-site  ← browser honestly reports it came from evil.com
  //   Sec-Fetch-Mode: no-cors
  //   Content-Type: application/x-www-form-urlencoded
  //
  // The browser can't lie about Sec-Fetch-Site — it's set by the browser itself,
  // not by any script on the page. We read it and block anything marked 'cross-site'.
  const fetchSite = req.headers['sec-fetch-site']
  if (fetchSite === 'cross-site') {
    return res.status(403).json({ message: 'Forbidden: cross-site request blocked' })
  }


  // CHECK 2: Origin header
  // Browsers include this on cross-origin requests and same-origin POST requests.
  // If it's present and doesn't match our frontend, something suspicious is happening.
  // If it's absent (e.g. curl, mobile app), we skip this check — it's not a browser CSRF attack.
  //
  // Attack example — an older browser that doesn't send Sec-Fetch-Site but does send Origin:
  //   POST /api/users/transfer HTTP/1.1
  //   Host: yoursite.com
  //   Cookie: token1=eyJhbGc...
  //   Origin: https://evil.com   ← reveals it came from evil.com
  //   Content-Type: application/x-www-form-urlencoded
  //
  // We check: is this Origin in our allowedOrigins list? It's not — so we block it.
  // If Origin is absent entirely (curl, mobile apps, server-to-server), we skip this
  // check — those aren't browser CSRF attacks and don't have cookies to abuse.
  const origin = req.headers['origin']
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ message: 'Forbidden: origin not allowed' })
  }


  // CHECK 3: X-Requested-With custom header
  // Our React frontend adds this header to every fetch() call (see Login.jsx, Logout.jsx, etc.).
  // Browsers require a CORS preflight before allowing any custom header on a cross-origin request.
  // Our CORS config only allows our frontend origin — so an attacker's page can't pass preflight
  // and therefore can't set this header. If it's missing, the request didn't come from our app.
  //
  // Attack example — why an attacker CAN'T forge this header from evil.com:
  //   Step 1: evil.com's script tries to send a fetch() with our custom header:
  //     fetch('https://yoursite.com/api/users/delete-account', {
  //       method: 'POST',
  //       headers: { 'X-Requested-With': 'XMLHttpRequest' },  // trying to fake it
  //       credentials: 'include'
  //     })
  //
  //   Step 2: Browser sees a custom header on a cross-origin request — triggers a preflight:
  //     OPTIONS /api/users/delete-account HTTP/1.1
  //     Host: yoursite.com
  //     Origin: https://evil.com
  //     Access-Control-Request-Headers: x-requested-with
  //
  //   Step 3: Our CORS config sees Origin: evil.com is not in our allowedOrigins.
  //     It does NOT include evil.com in Access-Control-Allow-Origin.
  //     The preflight fails. The actual POST never sends. The custom header never arrives.
  //
  //   Step 4: Our legitimate frontend at localhost:5000 CAN pass preflight because
  //     it IS in allowedOrigins. So our app works; the attacker's doesn't.
  //
  // If X-Requested-With is absent entirely, the request didn't come from our React app.
  if (!req.headers['x-requested-with']) {
    return res.status(403).json({ message: 'Forbidden: missing required request header' })
  }


  next()
}
