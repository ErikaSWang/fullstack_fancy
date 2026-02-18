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

// SQL INSERT NEW USER TO SUPABASE
export async function createUser(username, password) {
  const result = await sql`
    INSERT INTO users (username, password)
    VALUES (${username}, ${password})
    RETURNING id, username
  `
  return result[0]
}

/* Alternative syntax, as shown in the docs here: https://github.com/porsager/postgres
export async function createUser(username, password) {
  const result = await sql`
    INSERT INTO users ${
      sql({ username, password }, ['username', 'password'])
    }
    RETURNING id, username
  `
  return result[0]
}
  */


// SQL SEARCH FOR EXISTING USER IN SUPABASE
// (seems to need the index)
export async function findUser(username) {
  const result = await sql`
    SELECT id, username, password
    FROM users
    WHERE username = ${username}
  `
  return result[0]
}
