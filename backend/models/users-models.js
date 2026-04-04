import sql from '../providers/supabase-db.js'

// Create the table when the server starts (does nothing if it already exists)
/* Commenting this out after the first run, after we confirm it has been created)
await sql`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
  )
`
*/



// Alter the table to add a column for Google Auth ID's
// (And make it possible to leave the password blank, for people who login using Google)
/*
await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE
`

await sql`
  ALTER TABLE users
  ALTER COLUMN hashed_password DROP NOT NULL
`

await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) UNIQUE
`

await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS twitter_id VARCHAR(255) UNIQUE
`

await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
`

await sql`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
`
*/






// ============================================================
// SQL INJECTION PROTECTION — ALREADY BUILT IN
// ============================================================
// THE THREAT: SQL Injection
//
// If you built SQL queries by concatenating strings, a malicious user
// could type SQL code as their username/password and trick the database
// into running it. Classic example — username: ' OR '1'='1
// That turns "WHERE username = '...'" into a condition that's always
// true, returning every user in the database. Scary!
//
// HOW WE'RE PROTECTED:
// The `sql` template tag (from the 'postgres' / porsager library) sends
// queries to PostgreSQL as PREPARED STATEMENTS automatically. That means
// the query structure and the user-supplied values are sent separately:
//
//   What you write:  sql`SELECT * FROM users WHERE username = ${username}`
//   What gets sent:  query  → SELECT * FROM users WHERE username = $1
//                    params → ['actualUsernameValue']
//
// PostgreSQL receives them as two separate things and never interprets
// the value as SQL. No matter what the user types, it's just data —
// it can NEVER be executed as a command.
//
// The ${} syntax here is NOT regular JavaScript string interpolation.
// It's the library intercepting the value and routing it safely.
// This protection is automatic on every query in this file.
// ============================================================


// SQL INSERT NEW USER TO SUPABASE
export async function createUser(username, hashed_password) {
  const result = await sql`
    INSERT INTO users (username, hashed_password)
    VALUES (${username}, ${hashed_password})
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
    SELECT id, username, hashed_password
    FROM users
    WHERE username = ${username}
  `
  return result[0]
}


// SQL SEARCH FOR EXISTING GOOGLE USER
export async function findUserByGoogleId(googleId) {
  const result = await sql`
    SELECT id, username
    FROM users
    WHERE google_id = ${googleId}
  `
  return result[0]
}


// SQL CREATE NEW GOOGLE USER (no password)
export async function findOrCreateGoogleUser(googleId, displayName, email) {
  // Use email as username if available, otherwise fall back to display name
  const username = email || displayName

  const result = await sql`
    INSERT INTO users (username, google_id)
    VALUES (${username}, ${googleId})
    ON CONFLICT (google_id) DO UPDATE SET google_id = EXCLUDED.google_id
    RETURNING id, username
  `
  return result[0]
}


// SQL SEARCH FOR EXISTING TWITTER USER
export async function findUserByTwitterId(twitterId) {
  const result = await sql`
    SELECT id, username
    FROM users
    WHERE twitter_id = ${twitterId}
  `
  return result[0]
}


// SQL CREATE NEW TWITTER USER (no password)
export async function findOrCreateTwitterUser(twitterId, username) {
  const result = await sql`
    INSERT INTO users (username, twitter_id)
    VALUES (${username}, ${twitterId})
    ON CONFLICT (twitter_id) DO UPDATE SET twitter_id = EXCLUDED.twitter_id
    RETURNING id, username
  `
  return result[0]
}


// SQL SEARCH FOR EXISTING FACEBOOK USER
export async function findUserByFacebookId(facebookId) {
  const result = await sql`
    SELECT id, username
    FROM users
    WHERE facebook_id = ${facebookId}
  `
  return result[0]
}


// SQL CREATE NEW FACEBOOK USER (no password)
export async function findOrCreateFacebookUser(facebookId, displayName, email) {
  const username = email || displayName

  const result = await sql`
    INSERT INTO users (username, facebook_id)
    VALUES (${username}, ${facebookId})
    ON CONFLICT (facebook_id) DO UPDATE SET facebook_id = EXCLUDED.facebook_id
    RETURNING id, username
  `
  return result[0]
}
