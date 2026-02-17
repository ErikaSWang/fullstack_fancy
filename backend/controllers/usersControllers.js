import { createUser, findUser } from '../models/usersModel.js'

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
