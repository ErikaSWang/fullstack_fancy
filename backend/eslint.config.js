// ============================================================
// ESLINT — STATIC CODE ANALYSIS
// ============================================================
// ESLint reads your code WITHOUT running it, looking for problems.
// Think of it like a spell-checker, but for code quality and security.
//
// eslint-plugin-security adds security-specific rules on top of
// standard ESLint. It flags patterns that are dangerous even if they
// "work" — things that could be exploited by a malicious user.
//
// TO RUN:  npx eslint .
//          npx eslint . --fix   (auto-fixes safe issues like formatting)
//
// WHAT IT CHECKS FOR:
//  • eval() and variants — executes arbitrary strings as code (huge risk)
//  • setTimeout/setInterval with a string arg — same problem as eval
//  • ReDoS-vulnerable regex — patterns that cause catastrophic backtracking
//  • Non-literal fs operations — e.g. fs.readFile(userInput) → path traversal
//  • child_process.exec() with variables — could allow command injection
//  • Object injection — using user input as an object key unsafely
// ============================================================

import js from '@eslint/js'
import security from 'eslint-plugin-security'

export default [
  // ESLint's own recommended rules (catches common JS mistakes)
  js.configs.recommended,

  // Security plugin's recommended rules
  security.configs.recommended,

  {
    // Only lint our own source files — ignore dependencies
    ignores: ['node_modules/**'],

    languageOptions: {
      ecmaVersion: 'latest',   // we use modern JS (ES2022+, top-level await, etc.)
      sourceType: 'module',    // we use ES modules (import/export), not require()
      globals: {
        // Tell ESLint about Node.js globals so it doesn't flag them as undefined
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // Node 18+ built-in globals (ESLint doesn't know about these automatically)
        fetch: 'readonly',           // built into Node 18+, no import needed
        URLSearchParams: 'readonly', // built into Node 18+, no import needed
        Buffer: 'readonly',          // Node.js buffer global
      }
    },

    rules: {
      // ── security-plugin rules ──────────────────────────────────
      // These are all included via security.configs.recommended above.
      // Listed here explicitly so you can see what's being checked
      // and tweak individual rules if needed (e.g. "warn" vs "error").

      'security/detect-eval-with-expression': 'error',
        // Flags eval(someVariable) — running user-controlled strings as code
        // is one of the most dangerous things you can do in JS.

      'security/detect-non-literal-regexp': 'warn',
        // Flags new RegExp(userInput) — user-controlled regex could be
        // crafted to cause ReDoS (see input-validators.js for more on ReDoS).

      'security/detect-non-literal-fs-filename': 'warn',
        // Flags fs.readFile(variable) — if the variable comes from user input,
        // an attacker could read arbitrary files (path traversal attack).

      'security/detect-child-process': 'warn',
        // Flags child_process.exec(variable) — if the variable contains
        // user input, an attacker could run arbitrary shell commands.

      'security/detect-object-injection': 'warn',
        // Flags obj[userInput] — using user input as an object key can
        // let attackers access or overwrite prototype properties (__proto__, etc).

      'security/detect-possible-timing-attacks': 'warn',
        // Flags string equality checks (===) on secrets.
        // Timing attacks measure how long a comparison takes to infer
        // whether a guess was partially correct (used against tokens/passwords).
        // Use a constant-time comparison function instead (like crypto.timingSafeEqual).

      // ── general code quality ───────────────────────────────────
      'no-unused-vars': 'warn',       // unused variables are often leftover mistakes
      'no-console': 'off',            // we use console.log intentionally (pino handles prod logging)
    }
  }
]
