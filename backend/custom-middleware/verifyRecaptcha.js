// VERIFY GOOGLE reCAPTCHA v3 TOKEN
// Called on signup to confirm the user is likely human (silent, no checkbox)
// v3 returns a score: 1.0 = very likely human, 0.0 = very likely bot
// We reject anything below 0.5

// NOTE! THIS IS PLAIN VANILLA RECAPTCHA, NOT CLOUD ENTERPRISE RECAPTCHA
// CAREFUL NOT TO GET THE 2 MIXED UP!!

export async function verifyRecaptcha(req, res, next) {
    const { recaptchaToken } = req.body

    if (!recaptchaToken) {
        return res.status(400).json({ message: 'reCAPTCHA token missing' })
    }

    // URLSearchParams properly encodes special characters in the token (+ / = etc.)
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: new URLSearchParams({
            secret: process.env.RECAPTCHA_SECRET_KEY,
            response: recaptchaToken
        })
    })

    const data = await response.json()

    if (!data.success || data.score < 0.5) {
        return res.status(403).json({ message: 'reCAPTCHA check failed — please try again' })
    }

    next()
}
