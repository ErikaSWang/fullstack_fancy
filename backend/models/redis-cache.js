import { Redis } from '@upstash/redis'


// REDIS IS ANOTHER EXTERNAL SERVICE - BASICALLY SUPABASE FOR CACHE
// (The Redis npm package lets us connect via their API, using the URL and token from our .env file)
// (Had to sign up for a free account, and create a Redis database, to get the URL and token)

// NB IT LOOKS LIKE WE SIGNED UP AT UPSTASH AS WELL?
// UPSTASH IS WHERE THE CACHE IS ACTUALLY LOCATED

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default redis
