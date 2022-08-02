const registerRouter = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");

registerRouter.post('/', async (request, response) => {
    const { username, password } = request.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return response.status(400).json({
            error: 'Username must be unique.'
        });
    }

    if (username.length < 6) {
        return response.status(400).json({
            error: 'Username must be at least 6 characters long.'
        });
    }

    if (password.length < 6) {
        return response.status(400).json({
            error: 'Password must be at least 6 characters long.'
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
        username,
        passwordHash
    });

    const savedUser = await user.save();

    response.status(201).json(savedUser);
});

module.exports = registerRouter;