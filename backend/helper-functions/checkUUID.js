import redis from '../models/redis-cache.js'


// This is the front desk, where we can show our key for a fast-pass to the pool
// (If you haven't checked into the hotel, you have to do that to get the key first)

// TWO PART SYSTEM

// Users need to have key (long-term id) to get a pool pass (short-term) from the front desk
// REDIS USES THIS NUMBER TO VERIFY THEIR DATA
// (THIS STEP IS VERIFICATION ONLY)
// (my analogy fails here - would mean deleting the room key and issuing a fresh one every time, for security)
// (NEW POOL PASS GRANTED IN THE NEXT STEP)

export async function checkUUID(req, res, next) {
   res.set('Cache-Control', 'no-store')

  // Step 1. Check if the user has been logged in, the past 30 days (and still has their longterm cookie)
  //    - use cookie to extract the UUID
  const tokenUUID = req.cookies.token2

  
  // (Exit 1 - user hasn't been logged in
  //    - or user deletes cookies)
  if (!tokenUUID) return res.status(401).json({ message: 'No UUID token' })


  // Step 2. If UUID, check redis for user data
  const stored = await redis.get(`userID:${tokenUUID}`)

  // (Exit 2 - race condition where cookie lasted longer than the redis store??)
  if (!stored) return res.status(401).json({ message: 'Session has expired — please log in again' })

  // Step 3. Parse the user data
  const user = JSON.parse(stored)

  // Step 4. Pass it onto the next step in the pipeline
  req.user = user

  // NEXT - since valid hotel key, grant fresh pool pass (and delete the old hotel key and give new one)
  next()

}