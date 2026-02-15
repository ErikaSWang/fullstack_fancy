export const sendErrorMessage = (err, req, res, next) => {
    res.status(404).json(
        { 
            message: "404: Resource not found"
        }
    );
};

