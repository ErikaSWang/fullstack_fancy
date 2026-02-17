import sql from './db.js'

// Create the table when the server starts (does nothing if it already exists)
/* Commenting this out after the first run, after we confirm it has been created)
await sql`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
  )
`
*/

export async function createUser(username, password) {
  const result = await sql`
    INSERT INTO users (username, password)
    VALUES (${username}, ${password})
    RETURNING id, username
  `
  return result
}

export async function findUser(username) {
  const result = await sql`
    SELECT id, username, password
    FROM users
    WHERE username = ${username}
  `
  return result[0] 
}
