# Features of the Backend - all the bells & whistles needed to make it a real, state-of-the-art app


A. Part One
## Basic Express Server
- see manual-fullstack
  (API that listens for requests for data)

## Production Build (for deployment to Vercel)
- see manual-fullstack
  (some extra code that's not needed for development builds)
  (Vercel/Render/Replit won't work without it)


B. Part Two
## Logging
- see fullstack-security
  (adds a couple of basic messages to the terminal console)

## Error-handling
- see fullstack security
  (adds some messages to the developer console)
  (and also JSON to the failed route that you were trying to reach)

## Routing
- see fullstack-security
  (several ways to do it
        - can either add everything to server.js
        - or break it down into:
            - routes folder
            - controller folder (the meat/potatoes functions)
        (connected by chaining imports/exports)
  )

## Security headers
- see fullstack-security
  (like a recipe that narrows the options of who can do what)


C. Part Three
## Database & User Input
- see fullstack-supabase
