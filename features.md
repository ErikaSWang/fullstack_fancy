# Features of the Backend - all the bells & whistles needed to make it a real, state-of-the-art app


A. Part One
## Basic Express Server
- see manual-fullstack
  - server.js
  - package.json
  (API that listens for requests for data)
     server.js
        - express
        - cors
     vite.config.js
        - concurrently

## Production Build (for deployment to Vercel)
- see manual-fullstack
  - server.js
  - vite.config.js
  - vercel.json
  - package.json??
  (some extra code that's not needed for development builds)
  (Vercel/Render/Replit won't work without it)
        - path
        - url
        - fs


B. Part Two
## Logging
- see fullstack-security
  - server.js
  (adds a couple of basic messages to the terminal console)
        - morgan

## Error-handling
- see fullstack security
  - server.js
  (adds some messages to the developer console)
  (and also JSON to the failed route that you were trying to reach)
        - errorhandler
        - http-errors

## Routing
- see fullstack-security
  - server.js
  - routes/users-router.js
  (several ways to do it
    - can either add everything to server.js
    - or break it down into:
        - routes folder
        - controller folder (the meat/potatoes functions)
    (connected by chaining imports/exports)
  )
    - users-router.js
        - express (again)

## Security headers
- see fullstack-security
  - server.js
  - vercel.json??
  (like a recipe that narrows the options of who can do what)
        - helmet (LOTS of customization!)
        - customization


C. Part Three
## Supabase Database & User Input
- see fullstack-supabase
  - db.js
  - models/users-models.js
  - routes/users-router.js
  - server.js
  - app.jsx
  - .env
      db.js
        - postgres
        - .env (need to add database url)

## Hashing Passwords
- see fullstack-supabase
  - controllers/users-controllers.js
      users-controllers.js
        - bcryptjs

## JWT
- see fullstack-supabase
  - controllers/users-controllers.js
  - .env
  - app.js
      users-controllers.js
        - jsonwebtoken
      app.js
        - local storage

## Redis Cache
- see fullstack-supabase
  - .env
  -