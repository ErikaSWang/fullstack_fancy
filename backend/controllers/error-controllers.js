export const sendErrorMessage = (err, req, res, next) => {
    res.set('Cache-Control', 'no-store')
    const status = err.status || 500
    const message = err.message || 'Internal Server Error'
    res.status(status).json({ message })
};

