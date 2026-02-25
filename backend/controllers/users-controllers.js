import bcrypt from 'bcryptjs'
import { createUser, findUser } from '../models/users-model.js'
import { freshToken, blacklistToken } from '../controllers/jwt-auth.js'


// SIGNUP
// LOGIN
// LOGOUT


// LOGIN FUNCTIONS
// 1. HASHING PASSWORDS WITH BCRYPT
// 2. INTERACTING WITH SUPABASE DATABASE
//    - adding user
//    - getting user
//    (using postgreSQL, via postgres.js)
// 3. GENERATING JWT TOKENS WITH JSONWEBTOKEN
//    (INCLUDES INTERACTING WITH REDIS CACHE)


// LOGOUT FUNCTIONS
// 1. DELETE JWT TOKENS ON LOGOUT
//    (INCLUDES INTERACTING WITH REDIS CACHE)




// CREATE NEW ACCOUNT (signup)
// 3 steps:
    // (check for missing fields now handled by input-validators.js)
    // 1. Check if the username is already taken
    // 2.a) IF OK ...
    //       WE HASH THE PASSWORD
    //       b) THEN SEND THE USERNAME & PASSWORD TO SUPABASE
    // (Supabase adds a new row to the database, and we return a success message to the frontend)

// ADVANCED - NEW
// (added cache details to header
//    - NO STORING anywhere in the route (RE: remember CDNs often store info in caches))

export async function signup(req, res) {
  res.set('Cache-Control', 'no-store')
  const { username, password } = req.body



  // #2 Check if username is already taken ->
  // (forward to uses-model, which searches Supabase)

  const existing = await findUser(username)
  if (existing) {
    return res.status(409).json({ message: 'Username already exists' })
  }


  // #3 If ok, hash the password and create new user

  // HERE WE ADD BCRYPT - TO SCRAMBLE THE PASSWORD BEFORE STORAGE, FOR EXTRA SECURITY

  // BCRYPT.hash(password, 9) SCRAMBLES PASSWORD into a random-looking string
  // (the 9 is the "salt rounds" — how many times it re-scrambles (higher = slower but safer))
  const hashedPassword = await bcrypt.hash(password, 9)

  const user = await createUser(username, password, hashedPassword)
  res.status(201).json({ message: `User "${user.username}" created!`, user })
}



// LOG INTO EXISTING ACCOUNT (login)
// 3 steps:
    // (check for missing fields now handled by input-validators.js)
    // 1. Check if the username exists and the password matches
    // 2.a) IF NOT OK, send an error message
    //   b) IF OK ... next()
    // (pass along the chain to create a JWT token, cookie store, welcome message)


// ADVANCED - NEW
  // (added logging for failed attempts)

export async function login(req, res) {
  res.set('Cache-Control', 'no-store')
  const { username, password } = req.body


  // #2 Check if username exists ->
  // (forward to uses-model, which searches Supabase)

  const user = await findUser(username)


  // #3.a) If user doesn't exist, or password doesn't match, send error

  // HERE WE ADD BCRYPT TO 'CHECK' THE PASSWORD:
  //   Works in the following way:
  //      - .compare method READS STORED PASSWORD
  //        (because the hash tells it how many salt rounds were used)
  //      - HASHES THE INPUT USING THE SAME SALT ROUNDS
  //      - compares the two 
  //   (THERE IS NO 'UNHASHING' tool - but anyone with the hashed passwords would have the tool to be able to unhash them I guess)


  // ADVANCED - NEW
  // (added logging for failed attempts)

  if (!user) {
    console.log(`[AUDIT] Failed login - unknown user: "${username}" from IP ${req.ip}`)
    return res.status(401).json({ message: 'Invalid username or password' })
  }


  // ADVANCED - NEW
  // (added logging for failed attempts)

  const passwordMatch = await bcrypt.compare(password, user.hashed_password)

  if (!passwordMatch) {
    console.log(`[AUDIT] Failed login - wrong password for user: "${username}" from IP ${req.ip}`)
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  req.user = user
  freshToken(req, res)
  res.status(200).json({ message: `Welcome back, ${username}!`, username })
}




// LOG OUT (logout)

// REMEMBER, BACKEND IS STATELESS, AND SERVES SEVERAL USERS SIMULTANEOUSLY
// (that's why the token stays with the user, like a Movenpick Marche receipt, to prove they logged in)

// Tokens can be destroyed - they can only be 'blacklisted' (made invalid)
// (That's why they have a short expiry time)

// JWT.decode() only stores in the 'blacklist' while valid
// (then deletes to clear up cache after it's expired (listed in the token))


// ADVANCED - NEW
// (added logging for failed attempts)

export async function logout(req, res) {
  res.set('Cache-Control', 'no-store')

  await blacklistToken(req, res)

  res.status(200).json({ message: 'Logged out successfully' })
}
