import redis from '../providers/redis-cache.js'



// THIS IS THE RETURN MESSAGE WHEN THE USER LOADS THE PAGE, AND HAS AN ACTIVE JWT ALREADY
// JWT SHORT-TERM TOKEN -> RETURNS USERNAME
//
export async function statusJWT(req, res) {
  
  const { id, username } = req.user

  res.set('Cache-Control', 'no-store')
  res.status(200).json({ username: username })
}



// THIS IS THE RETURN MESSAGE WHEN THE USER LOADS THE PAGE, AND ONLY HAS A UUID STORED
// -> old UUID deleted -> fresh JWT created -> fresh UUID created 
//
export async function statusUUID(req, res) {

  const { id, username } = req.user
  
  res.set('Cache-Control', 'no-store')
  res.status(200).json({ message: 'Token refreshed', username })
}