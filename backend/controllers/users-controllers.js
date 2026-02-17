import { createUser, findUser } from '../models/users-model.js'


// CONTROLLER FUNCTIONS


// CREATE NEW ACCOUNT (signup)
// 3 steps:
    // 1. Validate the request body (check for missing fields)
    // 2. Check if the username is already taken
    // 3. IF OK, create the new user and send a success message
export async function signup(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  // Check if username is already taken
  const existing = await findUser(username)
  if (existing) {
    return res.status(409).json({ message: 'Username already exists' })
  }

  const user = await createUser(username, password)
  res.status(201).json({ message: `User "${user.username}" created!`, user })
}


// LOG INTO EXISTING ACCOUNT (login)
// 3 steps:
    // 1. Validate the request body (check for missing fields)
    // 2. Check if the username exists and the password matches
    // 3. IF OK, send a welcome message (in a real app, you would also create a session or send a token here)
export async function login(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  const user = await findUser(username)

  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid username or password' })
  }

  res.status(200).json({ message: `Welcome back, ${user.username}!` })
}
