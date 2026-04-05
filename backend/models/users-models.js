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
// THE THREAT: SQL Injection — four variations, all blocked at the root.
//
// All four techniques below only work if user input can be interpreted
// as SQL. Prepared statements make that impossible — so all four are
// neutralised by the same defence.
//
//  1. UNION-BASED INJECTION:
//     Attacker appends a UNION SELECT to piggyback a second query onto yours,
//     extracting data from other tables (e.g. all usernames + passwords).
//     Example input: ' UNION SELECT username, password FROM users --
//
//  2. ERROR-BASED INJECTION:
//     Attacker deliberately triggers a database error that includes data
//     in the error message (e.g. the database version, table names, column names).
//     They use that info to map your database structure for further attacks.
//
//  3. TIME-BASED (BLIND) INJECTION:
//     The app doesn't show query results or errors, so the attacker injects
//     a time delay (e.g. pg_sleep(5)) and measures the response time.
//     If the page takes 5 extra seconds, they know their condition was true.
//     Slow and patient, but it works — they can extract data one bit at a time.
//
//  4. OUT-OF-BAND INJECTION:
//     Instead of reading data from the HTTP response, the attacker makes
//     the database send data to an external server they control
//     (e.g. via a DNS lookup or HTTP request triggered from inside the DB).
//     Used when the other techniques are blocked or too slow.
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
// it can NEVER be executed as a command. All four attack types above
// require the input to BE SQL — so all four are stopped here.
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
    SELECT id, username, hashed_password, role
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
