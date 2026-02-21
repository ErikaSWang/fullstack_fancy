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
  - redis-cache.js
  - .env

## 'Protected' features/routes - available for logged in users only
- see fullstack-supabase
  (this one is quite involved, but same as above)
  - server.js
  - routes/content-router.js
  - controllers/content-controllers.js
  - models/content-models.js
  - jwt-authorization-check.js
  - app.js
      Store new comment:
        app.js
          - headers incl. jwt
          - body for comment
        server.js
          - import router, add route
        content-router.js
          - POST, with route ...
          - plus CHAIN OF FUNCTIONS ->
        -> jwt-auth-check.js
          - check the jwt (from the header, in jwt-auth-check.js)
            (AND get the user-id - REMEMBER THIS IS STATELESS)
        -> content-controllers.js
          - sends the user_id, and comment from the body to Supabase ->
        content-models.js
          - CAREFUL - ask for the right database
              - and ask for all the comments
              - and use the right user_id (not the id)


      Retrieve old comments:
        app.js
          - header again needs jwt
          - RESPONSE WILL HAVE 2 KEY:VALUE PAIRS!
            (one for the regular message, one for the database return (comments))
          - need comments.map((items) => ( ... ))
        content-router.js
          - GET, with route ...
          - plus CHAIN OF FUNCTIONS ->
        -> jwt-auth-check.js
          - check the jwt (from the header, in jwt-auth-check.js)
            (AND get the user-id - REMEMBER THIS IS STATELESS)
        -> content-controllers.js
          - sends the user_id to Supabase ->
          -> GETS BACK ALL THE USER'S PAST COMMENTS FROM THE DATABASE
          - attach a message
            (TWO KEY:VALUE PAIRS)
        content-models.js
          - CAREFUL - ask for the right database
            - and ask for all the comments
            - where the user.id (extracted in jwt-auth-check.js)


# Security, Part 2

## Rate Limiters



# Frontend

## Custom Hooks

