import express from 'express'
import cors from 'cors'
import welcomeRouter from './routes/welcome.js';
import errorMessagesRouter from './routes/errorMessages.js';



// SETTING UP THE SERVER
const app = express()
const PORT = process.env.PORT || 3000


// ALLOW CROSS-ORIGIN REQUESTS (CORS)
// PARSE JSON BODIES (json sent as strings, so the format needs to be checked?)
app.use(cors())
app.use(express.json())



// SECURITY MIDDLEWARE COMES VERY FIRST
import helmet from 'helmet'

app.use(helmet())



// LOGGING MIDDLEWARE GOES HERE
import morgan from 'morgan'

app.use(morgan('dev')) // Logs all incoming requests to the terminal console (nothing shows without it)





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

// 'Mounting' the error messages router
app.use('/api', errorMessagesRouter);


// HTTP HEADER SECURITY MIDDLEWARE
// (helmet is now applied early in the middleware stack above)






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
