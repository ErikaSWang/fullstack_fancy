import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'



// SLOW DOWN
// Adds a delay to responses before the hard block kicks in
// (real users who mistype will notice the lag; bots get frustrated)

export const loginSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,  // same window as loginLimiter
  delayAfter: 3,              // start slowing down after 5 attempts
  delayMs: (hits) => hits * 500  // each attempt adds 500ms more delay
})

export const commentSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,  // same window as loginLimiter
  delayAfter: 20,              // start slowing down after 5 attempts
  delayMs: (hits) => hits * 500  // each attempt adds 500ms more delay
})



// RATE LIMITERS
// Set how many times a user can try logging in (or signing up)
// (to avoid hacking attempts)
// (WORKS BY BLOCKING BY IP ADDRESS (not by browser))
// (Claude says the number of attempts is stored in the server - and since Vercel
//  sometimes uses multiple servers, MAY need to use Redis to keep track instead)

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  message: { message: 'Too many login attempts — please try again in 15 minutes' }
})

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { message: 'Too many accounts created — please try again in an hour' }
})

export const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { message: 'Too many accounts created — please try again in an hour' }
})





