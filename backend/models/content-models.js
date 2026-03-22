import sql from './supabase-db.js'

// Create the table when the server starts (does nothing if it already exists)
/* Commenting this out after the first run, after we confirm it has been created)

await sql`
  CREATE TABLE IF NOT EXISTS user_content (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL
  )
`
*/




// NOT NEEDED, BECAUSE OF JWT: Looking up user AGAIN in Supabase
// (we are using the 'jwt id card' as a Movenpick Marche tab, instead)


// ADD DATA TO THE CORRECT USER

export async function addContent(user_id, content) {
  const result = await sql`
    INSERT INTO user_content (user_id, content)
    VALUES (${user_id}, ${content})
    RETURNING id, content
  `
  return result[0]
}



// GET USER'S PAST ENTRIES FROM SUPABASE

export async function getContent(user_id) {
  const result = await sql`
    SELECT * FROM user_content
    WHERE user_id = ${user_id}
  `
  return result
}