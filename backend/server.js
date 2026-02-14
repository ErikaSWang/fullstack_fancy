import express from 'express'
import cors from 'cors'
import welcomeRouter from './routes/welcome.js';
import errorMessagesRouter from './routes/errorMessages.js';



// SETTING UP THE SERVER
const app = express()
const PORT = process.env.PORT || 3000

// allow cross-origin requests (CORS)
// parse json bodies (json sent as strings, so the format needs to be checked?)
app.use(cors())
app.use(express.json())



// HTTP HEADER SECURITY MIDDLEWARE COMES FIRST (before logging and routes)
// (helps protect against common vulnerabilities like XSS, clickjacking, etc.)
import helmet from 'helmet'

app.use(helmet())



// LOGGING MIDDLEWARE COMES NEXT
// Logs all incoming requests to the terminal console (nothing shows without it)
import morgan from 'morgan'

app.use(morgan('dev')) 




// ACTUAL ROUTES HERE
// API routes must come before static file serving

// 'Mounting' the welcome router
app.use('/api', welcomeRouter);

app.get('/api/hello', (req, res) => {
  res.status(200).json(
    { 
      message: 'Hello from the backend!'
    }
  )
});




// ERROR HANDLING MIDDLEWARE COMES AFTER THE ROUTES
// (catches errors thrown in the routes and sends a response to show the user)

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
// 'Mounting' the error messages router
app.use('/api', errorMessagesRouter);

// #3 Error handler (final catch-all)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ message: message });
});




// PRODUCTION BUILD - SERVE REACT APP
// For Vercel and Render - builds a production mode version of the app

import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')))

  // Handle React routing - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'))
  })
}

// Only listen when running locally, not on Vercel (don't need this for Render??)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
}

// Export for Vercel serverless
export default app
