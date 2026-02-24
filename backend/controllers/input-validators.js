import { body, validationResult } from 'express-validator'


// ADVANCED - NEW
// 1. INPUT SANITIZATION
// 2. INPUT VALIDATION

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

export const validateSignup = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .escape()
    .isLength({ min: 3, max: 18 }).withMessage('Username must be 3-20 characters')
    .isAlphanumeric().withMessage('Username can only contain letters and numbers'),

  body('password')
    .isLength({ min: 8, max: 24 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
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
    .escape()
    .isLength({ max: 24 }).withMessage('Invalid password'),
]


// CATCHALL MESSAGE FOR FAILURES ABOVE THAT DIDN'T RETURN A MESSAGE
// (runs after the rules above, returns 400 if anything failed)

export function validationLogging(req, res, next) {
  const errors = validationResult(req)
  console.log(errors.array())  // should log results to the terminal console?
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}
