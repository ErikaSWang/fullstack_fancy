
// REDIRECT NEEDS TO BE CUSTOMIZED FOR PRODUCTION
const successRedirect = process.env.NODE_ENV === 'production'
  ? 'https://fullstack-fancy.vercel.app'
  : 'http://localhost:5000'


// A. GOOGLE

// This redirects the user back to the front page, after successful signin using Google Sign-in
//
export function redirectGoogle(req, res, _next) {
  res.redirect(successRedirect || '/')
}


// B. FACEBOOK

// This redirects the user back to the front page, after successful signin using Facebook Sign-in
//
export function redirectFacebook(_req, res, _next) {
  res.redirect(successRedirect || '/')
}

