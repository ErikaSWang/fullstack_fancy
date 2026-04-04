import { body, validationResult } from 'express-validator'


// ============================================================
// INPUT SANITIZATION & VALIDATION
// ============================================================
// THE THREATS:
//
//  • XSS (Cross-Site Scripting) — three variations, all defended here:
//
//    1. STORED XSS (aka Persistent XSS):
//       Attacker submits a username like <script>stealCookies()</script>.
//       It gets saved to the database. Every user who views that username
//       later has the script run in their browser — stealing cookies,
//       redirecting them, etc.
//       → .escape() converts < > & " ' into harmless HTML entities before storage.
//       → .isAlphanumeric() on usernames rejects anything that isn't
//         letters/numbers outright — so no special characters get through at all.
//
//    2. REFLECTED XSS:
//       Malicious script is embedded in a URL (e.g. a link in a phishing email).
//       The server reads a query parameter and "reflects" it back in the HTML
//       response without sanitizing it — the script runs immediately on page load.
//       → .escape() and .isAlphanumeric() sanitize all user-supplied input
//         before it could ever appear in a response.
//       → Helmet's Content Security Policy (see server.js) is the main defence:
//         even if a script tag somehow slipped through, CSP prevents it from running.
//
//    3. DOM-BASED XSS:
//       Happens entirely in the browser — no server involvement at all.
//       Malicious JavaScript reads from sources like window.location or
//       document.URL and writes it directly into the DOM (e.g. innerHTML).
//       → React protects against this automatically: it escapes all values
//         before rendering them. The only way to bypass it is to explicitly
//         use dangerouslySetInnerHTML — which we never do.
//
//  • Oversized inputs / buffer attacks: Sending a 10MB "username"
//    could crash your server or overwhelm your database.
//    → .isLength() enforces hard limits on every field.
//
//  • ReDoS (Regular Expression Denial of Service): A specially crafted
//    input string can cause certain regex patterns to take exponential time
//    to evaluate (catastrophic backtracking), spiking CPU to 100% on one request.
//    → The password regex below (line ~39) has been reviewed and is NOT vulnerable:
//      it uses simple lookaheads with no nested quantifiers or ambiguous alternation.
//      The 'safe-regex' package can be used to audit regex patterns for this — but
//      it isn't needed here since we have no user-supplied regex and the one
//      hand-written pattern is straightforward.
// ============================================================

// This is the customized feature of express-validator : https://express-validator.github.io/docs/guides/customizing
// (body() is used create different checks for the username & password)
// (otherwise check() will look at them both the exact same way)
// (other parts to check: params, query, cookies, headers)

// Common items to check:
//   - email (format?)
//   - text (for offensive words?)

// Common characteristics to check:
//   - format of the input (correct, expected)
//   - not code?

// Can I log the results of the check with this? const result = validationResult(req).array();
// Offensive word check? body('comment').muteOffensiveWords(),

// (CHAIN of checks, no comma at the end of each line)
// no .escape() on passwords — bcrypt handles the security, and escaping mutates the value

export const validateSignup = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    // .escape() — converts special characters to HTML entities (e.g. < becomes &lt;) to prevent XSS attacks
    .escape()
    .isLength({ min: 3, max: 18 }).withMessage('Username must be 3-20 characters')
    // .isAlphanumeric() rejects anything that isn't letters/numbers — so <script>, onerror=, onload= all fail immediately
    .isAlphanumeric().withMessage('Username can only contain letters and numbers'),

  body('password')
    .isLength({ min: 8, max: 24 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')  
]


// LOGIN RULES
// (looser - just prevents empty fields and absurdly large inputs)

export const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .escape()
    .isLength({ max: 18 }).withMessage('Invalid username'),

  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 24 }).withMessage('Invalid password'),
]


// CONTENT / COMMENTS RULES
// (no .escape() — React escapes on render, so escaping here would double-encode stored text)

export const validateInput = [
  body('content')
    .trim()
    .notEmpty().withMessage('Content cannot be empty')
    .isLength({ max: 1000 }).withMessage('Content cannot exceed 1000 characters')
]


// CATCHALL MESSAGE FOR FAILURES ABOVE THAT DIDN'T RETURN A MESSAGE
// (runs after the rules above, returns 400 if anything failed)

export function validationLogging(req, res, next) {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    console.log('[VALIDATION] Failed:', errors.array())
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}
