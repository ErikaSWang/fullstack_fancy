import redis from '../models/redis-cache.js'


// AFTER CHECK FOR VALID UUID
// THIS MIDDLEWARE DELETES THE OLD ONE AS PREP FOR REISSUING A NEW ONE
//
export async function deleteUUID(req, res, next) {

    const tokenUUID = req.cookies.token2
    
    await redis.del(`userID:${tokenUUID}`)

    
    res.clearCookie('token2', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/api',
    })


    // NEXT - is fresh JWT, UUID
    next()
}