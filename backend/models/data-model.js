import sql from './supabase-db.js'

// Create the table when the server starts (does nothing if it already exists)
// Commenting this out after the first run, after we confirm it has been created)

await sql`
  CREATE TABLE IF NOT EXISTS user_data (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL
  )
`

// SQL LOOK UP USER IN SUPABASE





// ADD DATA TO TO CORRECT USER

export async function addData(user_id, content) {
  const result = await sql`
    INSERT INTO user_data (user_id, content)
    VALUES (${user_id}, ${content})
    RETURNING id, content
  `
  return result[0]
}