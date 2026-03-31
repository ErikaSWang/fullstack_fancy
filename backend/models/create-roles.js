import sql from '../providers/supabase-db.js'

// Create the table when the server starts (does nothing if it already exists)
/* Commenting this out after the first run, after we confirm it has been created)
await sql`
  CREATE ROLE admin WITH LOGIN PASSWORD 'Abcde123:o'
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA users TO admin;
`
*/