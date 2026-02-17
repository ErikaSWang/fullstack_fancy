import express from 'express'
import cors from 'cors'
import welcomeRouter from './routes/welcome.js';
import usersRouter from './routes/users.js';
import { sendErrorMessage } from './controllers/errorControllers.js';


// SETTING UP THE SERVER
const app = express()
const PORT = process.env.PORT || 3000


// HTTP HEADER SECURITY MIDDLEWARE COMES FIRST (before everything)
// (helps protect against common vulnerabilities like XSS, clickjacking, etc.)
import helmet from 'helmet'

// app.use(helmet())

app.use(helmet({
  // This solves "CSP not implemented"
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "font-src": ["'self'", "https:", "data:"],
      "frame-src": ["'none'"],
      "frame-ancestors": ["'none'"], // Stronger version of X-Frame-Options
      "img-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "script-src": ["'self'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "https:"],
      "connect-src": ["'self'"],
      "media-src": ["'self'"],
      "form-action": ["'self'"]
    },
  },
  // This solves "X-Frame-Options"
  frameguard: {
    action: "deny",
  },
  // This solves "X-Content-Type-Options"
  noSniff: true,
}));


// ADDITIONAL CUSTOM HEADER SECURITY come next
// https://www.upguard.com/webscan
app.use((req, res, next) => {
  res.set({
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'geolocation=(), microphone=()'
  });
  next();
});


// REQUEST HANDLING
// allow cross-origin requests (CORS)
// parse json bodies (json sent as strings, so the format needs to be checked?)
app.use(cors())
app.use(express.json())



// LOGGING MIDDLEWARE is here next
// Logs all incoming requests to the terminal console (nothing shows without it)
import morgan from 'morgan'

app.use(morgan('dev')) 



// RESPONSE HANDLING
import compression from 'compression';

app.use(compression());



// PRODUCTION BUILD - SERVE REACT APP
// For Vercel and Render - builds a production mode version of the app

import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Check if React build exists (only check once)
const publicPath = path.join(__dirname, '../public')
const serveReactApp = fs.existsSync(publicPath)

// Serve static files from React build
if (serveReactApp) {
  app.use(express.static(publicPath))
}




// ACTUAL ROUTES HERE

// 'Mounting' the welcome router (additional routes defined in the separate folder)
app.use('/api', welcomeRouter);
app.use('/api/users', usersRouter);

// Route defined right here
app.get('/api/hello', (req, res) => {
  res.status(200).json(
    {
      message: 'Hello from the backend!'
    }
  )
});




// Handle React routing - serve index.html for all non-API routes
// This must come AFTER API routes but BEFORE error handlers
if (serveReactApp) {
  app.get('*', (req, res, next) => {
    // Skip API routes - let them fall through to error handlers
    if (req.path.startsWith('/api')) {
      return next()
    }
    res.sendFile(path.join(publicPath, 'index.html'))
  })
}




// ERROR HANDLING MIDDLEWARE goes after everything else
import errorhandler from 'errorhandler'
import createError from 'http-errors'

if (process.env.NODE_ENV === 'development') {
  app.use(errorhandler())
}

// #1 ERROR-HANDLER - catch undefined routes
// (passes 404 to the next error handler if no route matches the request)
app.use((req, res, next) => {
  next(createError(404));
});

// #2 ERROR-HANDLER - this will catch the 404 error created above and send a JSON response instead of the default HTML page
// Just an import of code, because routers only work with specific routes
app.use(sendErrorMessage);

// #3 ERROR-HANDLER - final catch-all
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || '500: Internal Server Error';

  res.status(status).json({ message: message });
});



// OPEN PORT FOR LOCAL DEPLOYMENT
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
}

// EXPORT FOR VERCEL AND RENDER
export default app
