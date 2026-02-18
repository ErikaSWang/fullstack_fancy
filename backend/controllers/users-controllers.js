import { createUser, findUser } from '../models/users-model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


// LOGIN FUNCTIONS
// 1. HASHING PASSWORDS WITH BCRYPT
// 2. GENERATING JWT TOKENS WITH JSONWEBTOKEN
// 3. INTERACTING WITH SUPABASE DATABASE (using postgreSQL, via postgres.js)


// SHARED MINI-FUNCTIONS (used by both signup and login)
// (true if something is missing)
const checkMissingFields = (username, password, res) => {
  if (!username || !password) {
    res.status(400).json({ message: 'Username and password are required' })
    return true
  }
  return false
}




// CREATE NEW ACCOUNT (signup)
// 3 steps:
    // 1. Validate the request body (check for missing fields)
    // 2. Check if the username is already taken
    // 3. IF OK ...
    //      a) WE HASH THE PASSWORD
    //      b) THEN SEND THE USERNAME & PASSWORD TO SUPABASE
    // (Supabase adds a new row to the database, and we return a success message to the frontend)

export async function signup(req, res) {
  const { username, password } = req.body

  // #1 Check for missing fields (validation)
  // (helper mini-function defined above)
  // if missing fields, it will end the signup right here

  if (checkMissingFields(username, password, res)) return


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
    // 1. Validate the request body (check for missing fields)
    // 2. Check if the username exists and the password matches
    // 3.a) IF NOT OK, send an error message
    // 3.b) IF OK, send a welcome message 

export async function login(req, res) {
  const { username, password } = req.body

  // #1 Check for missing fields (validation)
  // (helper mini-function defined above)

  if (checkMissingFields(username, password, res)) return


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


  const passwordMatch = user && await bcrypt.compare(password, user.hashed_password)
  if (!user || !passwordMatch) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  // #3.b) If ok, we sign the person in, and ADD AN AUTHORIZATION TOKEN

  // HERE IS WHERE WE ADD JSONWEBTOKEN 

  // jwt.sign() STORES USER DATA, TO AVOID MULTIPLE DATABASE CALLS (like an open tab)
  // (best to keep the duration short, and refresh it?)

  // CAREFUL! DATA IS VISIBLE TO THE PUBLIC
  // NEVER PASS SENSITIVE DATA BACK TO THE FRONTEND!!!


  const token = jwt.sign(
    {
      id: user.id,
      username: user.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h' 
    }
  )

  res.status(200).json({ message: `Welcome back, ${user.username}!`, token })
}
