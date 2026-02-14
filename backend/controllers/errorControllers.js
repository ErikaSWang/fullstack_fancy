export const sendErrorMessage = (req, res) => {
    res.status(404).json(
        { 
            message: "404: Resource not found"
        }
    );
};

