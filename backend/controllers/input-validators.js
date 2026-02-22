import { body, validationResult } from 'express-validator'


// SIGNUP RULES
// (stricter - enforces what a valid username/password looks like)

export const validateSignup = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters')
    .isAlphanumeric().withMessage('Username can only contain letters and numbers'),

  body('password')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be at least 8 characters'),
]


// LOGIN RULES
// (looser - just prevents empty fields and absurdly large inputs)

export const validateLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ max: 20 }).withMessage('Invalid username'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 100 }).withMessage('Invalid password'),
]


// ERROR CHECKER
// (runs after the rules above, returns 400 if anything failed)

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg })
  }
  next()
}
