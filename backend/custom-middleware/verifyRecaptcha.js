// VERIFY GOOGLE reCAPTCHA v2 TOKEN
// Called on signup to confirm the user clicked the "I'm not a robot" checkbox
// v2 is simple: data.success is either true (human) or false (bot/expired)

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

    if (!data.success) {
        return res.status(403).json({ message: 'reCAPTCHA check failed — please try again' })
    }

    next()
}
