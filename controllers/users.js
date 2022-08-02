const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", async (request, response) => {
    const users = await User.find()
    .populate({ path: "exercises", select: "-user" })
    .populate({
        path: "workouts",
        select: "-user",
        populate: [{
            path: "exercises",
            populate: [
                { path: "exercise", select: "-user -description"}
            ]
        }]
    });

    response.json(users);
});

usersRouter.get("/:userId", async (request, response) => {
    const userId = request.params.userId;
    const user = await User.findById(userId)
        .populate({ path: "exercises", select: "-user" })
        .populate({
            path: "workouts",
            select: "-user",
            populate: [{
                path: "exercises",
                populate: [
                    { path: "exercise", select: "-user -description"}
                ]
            }]
        });
    response.json(user);
});

usersRouter.delete('/:userId', async (request, response) => {
    await User.findByIdAndDelete(request.params.userId);
    response.status(204).end();
});

module.exports = usersRouter;