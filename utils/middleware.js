const jwt = require("jsonwebtoken");
const User = require("../models/user");

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "Unknown endpoint." });
}

const errorHandler = (error, request, response, next) => {
    if (error.name === "CastError") {
        return response.status(400).send({
            error: "Malformatted ID."
        });
    } else if (error.name === "ValidationError") {
        return response.status(400).json({
            error: error.message
        });
    }

    next(error);
}

const userExtractor = async (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer')) {
        const token = authorization.substring(7);
        const decodedToken = jwt.verify(token, process.env.SECRET);

        if (!decodedToken.id) {
            response.status(401).json({
                error: "Token missing or invalid."
            });
        }
    
        request.user = await User.findById(decodedToken.id);
    }

    next();
}

module.exports = {
    unknownEndpoint,
    errorHandler,
    userExtractor
};