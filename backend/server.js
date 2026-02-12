import express from 'express'
import cors from 'cors'


const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// API routes must come before static file serving
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the backend!' })
})



// For Vercel AND Render - builds a production mode version of the app

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
