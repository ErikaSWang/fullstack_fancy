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
    (CAREFUL TO SPECIFY THE CONNECTION AS 'TRANSACTION POOLER' (i forgot why))

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
- see fullstack-2xsecurity

## Rate Limiters
  - users-model.js
  - rate-limiters.js
      rate-limiters.js
        - express-rate-limit
        - express-slow-down

## Logging
  - (where did I add these)
  - morgan?

## Input Validators
  - (where did I add these)
  - helmet?

## JSON Web Tokens (JWTs)
  - (add file names later)
  - jwt?

## Google reCAPTCHA
  - https://developers.google.com/recaptcha/intro?_gl=1*1svz20u*_up*MQ..*_ga*MTU0ODk3MjQyNS4xNzczODk4MjQw*_ga_SM8HXJ53K2*czE3NzM4OTgyMzkkbzEkZzAkdDE3NzM4OTgyMzkkajYwJGwwJGgw
  - CAREFUL: There's a regular, and an enterprise (the UI looks the same)
      - the code Claude added doesn't look anything like the samples, so just let AI write it, and forget about it
  - TWO keys:
      1. Public key (frontend)
      2. Private key (backend)
  - TWO types:
      1. V2 checkbox - very old school
        (where to add more sites:
          https://www.google.com/recaptcha/admin/site/747605690/settings
        )
      2. V3 scoring - invisible
        (where to add more sites:
          https://www.google.com/recaptcha/admin/site/747636696/settings
        )

# oAuth 2.0
- we are using passport
- each one needs to be done individually
    1. Google Cloud
        - sign up for new project
        - WEB APPLICATION
        - ask Claude for the callback url, and submit
        - will get a:
            - Client ID
            - Client Secret
        - SEE THE .env file
      (NB Both Vercel's callback url and locally needs to be whitelisted)
      (And both need to be added to the .env)
  2. Facebook Developer
      - basically the same as above, since it is also passport
  3. Twitter Developer
      - needs a different package


# Health Check


# More on Hacking Attempts & the Security Middleware We're Using

1. IP Spoofing (using fake IPs)
    What hackers are trying to do:
      1. Bypass rate limiting (most relevant to your app)
      Your rate limiter blocks an IP after too many login attempts. If an attacker can fake their IP address, they just rotate through fake IPs and get unlimited attempts — effectively defeating your brute force protection entirely. This is the most direct threat to your app specifically.

      2. Bypass IP blocklists
      If a security system has banned a known malicious IP, the attacker spoofs a different one to get back in.

      3. Hide their identity
      Law enforcement and server logs track IP addresses. Spoofing makes it harder to trace an attack back to the real person.

      4. Amplification DDoS attacks
      A more advanced technique — attacker sends requests with a victim's IP as the spoofed source. The server sends its (large) responses to the victim instead of the attacker, flooding the victim with traffic they never asked for.

      Is IP spoofing different from someone using a VPN?
      Great question — they sound similar but they're quite different!

      VPN:

      A legitimate tool — the user routes their traffic through a VPN server, so your server sees the VPN's IP instead of theirs
      The VPN provider knows who the real user is
      The connection is still a real, properly established TCP connection
      Used for privacy, security on public WiFi, accessing geo-restricted content, etc.
      Legal and common — millions of normal users do this daily
      IP Spoofing:

      Malicious technique — the attacker forges the source IP address in the network packet itself
      Nobody is actually at that fake IP address — it's fabricated
      Has a fundamental limitation: responses go to the fake IP, not the attacker — so it mostly only works for attacks that don't need a response (like DDoS floods)
      For anything requiring a back-and-forth conversation (like logging into your app), true IP spoofing doesn't really work because the TCP handshake can't complete
      The X-Forwarded-For header spoofing (what your app actually protects against) is slightly different — an attacker manually adds a fake header to their real request claiming to be from a different IP. This does work at the application layer, which is exactly why trust proxy: 1 matters
      Practical implication for your app:

      A VPN user hits your rate limiter just like anyone else — the VPN's IP gets rate limited. If a VPN has many users, they might share rate limit consequences, but that's a minor edge case.

      The real threat is the X-Forwarded-For header manipulation — which you're already protected against. ✅

      So an IP spoofer couldn't just use a ton of VPNs to try and accomplish whatever it is they are trying to do?
      They absolutely could — and this is actually a real attack technique! It even has a name: credential stuffing or distributed brute force when done at scale.

      The modern reality is attackers don't even need to manually switch VPNs — they rent access to botnets (networks of thousands of compromised computers, each with their own real IP) or use residential proxy networks (services that route traffic through real people's home connections, often without those people knowing).

      So a sophisticated attacker could:

      Get a list of username/password combinations from a data breach
      Try them across thousands of different IPs simultaneously
      Each IP only makes 1-2 attempts — never triggering your rate limiter
      This is genuinely hard to fully solve at the application level. The honest answer is:

      Layer	What it stops
      Your rate limiter	Unsophisticated single-IP brute force
      reCAPTCHA	Automated bots (they can't solve it cheaply at scale)
      bcrypt slow hashing	Makes each attempt expensive even if they get in
      Cloudflare / WAF	Can detect and block distributed patterns across IPs
      Account lockout	Limits damage per account regardless of IP count
      reCAPTCHA is actually your strongest defence here — even with 10,000 different IPs, solving a reCAPTCHA for each attempt costs real money and time. That's why Google's bot detection is valuable beyond just the checkbox.

      For a learning project your current setup is solid. At production scale with real users, adding Cloudflare in front of your app would be the next meaningful step. 😊