import { createUser, findUser } from '../models/users-model.js'


// FUNCTIONS


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
    // 3. IF OK, create the new user and send a success message

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

  // #3 If ok, create new user
  const user = await createUser(username, password)
  res.status(201).json({ message: `User "${user.username}" created!`, user })
}


// LOG INTO EXISTING ACCOUNT (login)
// 3 steps:
    // 1. Validate the request body (check for missing fields)
    // 2. Check if the username exists and the password matches
    // 3.a) IF NOT OK, send an error message
    // 3.b) IF OK, send a welcome message (in a real app, you would also create a session or send a token here)

export async function login(req, res) {
  const { username, password } = req.body

  // #1 Check for missing fields (validation)
  // (helper mini-function defined above)
  if (checkMissingFields(username, password, res)) return

  // #2 Check if username exists ->
  // (forward to uses-model, which searches Supabase)
  const user = await findUser(username)

  // #3.a) If user doesn't exist, or password doesn't match, send error
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  // #3.b) If ok, welcome
  res.status(200).json({ message: `Welcome back, ${user.username}!` })
}
