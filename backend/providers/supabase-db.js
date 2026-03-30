import postgres from 'postgres'


// This is where we connect to supabase, via the project URL (saved in .env) and the postgres library. We export the connection as sql, which we can then use in our other files to query the database.
const supabase_connection = process.env.DATABASE_URL


// This is what we will call the database (we need postgres to make it work in node.js)
const sql = postgres(supabase_connection)

export default sql
