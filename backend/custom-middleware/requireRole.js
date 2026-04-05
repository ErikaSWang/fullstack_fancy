// ============================================================
// ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
// ============================================================
// THE THREAT: Privilege Escalation
//
// Authentication answers "who are you?" — it verifies your identity.
// Authorization answers "what are you allowed to do?" — it checks your permissions.
// These are two separate steps, and you need BOTH.
//
// Without role checks, any logged-in user could hit admin endpoints
// just by knowing the URL. For example:
//   GET /api/admin/dashboard  ← a regular user shouldn't see this
//   DELETE /api/admin/users/5 ← definitely not!
//
// HOW IT WORKS:
// When a user logs in, their role ('user', 'admin', etc.) is embedded
// inside their JWT token payload. checkJWT verifies the token and puts
// the decoded payload on req.user — so req.user.role is already available
// by the time requireRole runs.
//
// This means no extra database lookup on every request — the role travels
// securely inside the signed token. An attacker can't tamper with it
// because the token is signed with our JWT_SECRET (changing any part of
// the payload invalidates the signature).
//
// USAGE — place AFTER checkJWT in the route chain:
//
//   import { checkJWT } from '../helper-functions/checkJWT.js'
//   import { requireRole } from '../custom-middleware/requireRole.js'
//
//   router.get('/dashboard', checkJWT, requireRole('admin'), dashboardController)
//
// You can pass any role string — 'admin', 'moderator', 'premium', etc.
// Just make sure the role column in your database uses the same strings.
// ============================================================


export function requireRole(role) {

  // requireRole() returns a middleware function — this pattern is called
  // a "middleware factory". You call requireRole('admin') and it hands back
  // the actual (req, res, next) function with 'admin' baked in.

  return (req, res, next) => {

    // checkJWT must run before this — it puts the decoded token on req.user.
    // If req.user is missing, something is wired up wrong in the route chain.
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    // Check the role embedded in the JWT payload against the required role.
    // If it doesn't match, return 403 Forbidden (not 401 — the user IS
    // authenticated, they just don't have permission for this specific resource).
    //
    // 401 = "I don't know who you are" (not logged in)
    // 403 = "I know who you are, but you're not allowed here" (wrong role)
    if (req.user.role !== role) {
      console.log(`[AUDIT] Forbidden access attempt — user: "${req.user.username}", role: "${req.user.role}", required: "${role}", path: ${req.path}`)
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' })
    }

    next()
  }
}
