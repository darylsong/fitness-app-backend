const exercisesRouter = require("express").Router();
const User = require("../models/user");
const Exercise = require("../models/exercise");

exercisesRouter.get("/:userId/exercises", async (request, response) => {
    const userId = request.params.userId;
    
    // Check credentials
	if (!request.user || userId !== request.user.id.toString()) {
		return response.json({
			error: "Wrong credentials"
		});
	}

    const user = await User.findById(userId).populate({
        path: "exercises",
        populate: [
            { path: "user", select: "-exercises -workouts" }
        ]
    });
    const exercises = user.exercises;
    response.json(exercises);
});

exercisesRouter.get('/:userId/exercises/:exerciseId', async (request, response) => {
    const exerciseId = request.params.exerciseId;
    const userId = request.params.userId;
    const user = await User.findById(userId);

    // Check credentials
	if (!request.user || userId !== request.user.id.toString()) {
		return response.json({
			error: "Wrong credentials"
		});
	}

    // Check if user exists
    if (!user) {
        return response.status(404).json({
            error: 'User not found.'
        });
    }

    // Check if exercise exists
    const exercise = await Exercise.findById(exerciseId).populate("user", { exercises: 0, workouts: 0 });

    if (!exercise) {
        return response.status(404).end();
    }

    response.json(exercise);
});

exercisesRouter.post("/:userId/exercises", async (request, response) => {
    const { name, description } = request.body;
    const userId = request.params.userId;
    const user = await User.findById(userId).populate("exercises");

    // Check credentials
	if (!request.user || userId !== request.user.id.toString()) {
		return response.json({
			error: "Wrong credentials"
		});
	}

    // Check if user exists
    if (!user) {
        return response.status(404).json({
            error: 'User not found.'
        });
    }

    // Check if exercise already exists.
    const existingExercise = user.exercises.find(exercise => exercise.name === name);
    if (existingExercise) {
        return response.status(400).json({
            error: 'Exercise name must be unique.'
        });
    }

    // Check that the exercise name is valid.
    if (name.length < 6) {
        return response.status(400).json({
            error: 'Exercise name must be at least 6 characters long.'
        });
    }

    const exercise = new Exercise({
        name,
        description,
        user: user._id
    });

    const savedExercise = await exercise.save();
    user.exercises = user.exercises.concat(savedExercise);
    await user.save();
    response.status(201).json(savedExercise);
});

exercisesRouter.put('/:userId/exercises/:exerciseId', async (request, response) => {
    const { name, description } = request.body;
    const exerciseId = request.params.exerciseId;
    const userId = request.params.userId;
    const user = await User.findById(userId).populate("exercises");

    // Check credentials
	if (!request.user || userId !== request.user.id.toString()) {
		return response.json({
			error: "Wrong credentials"
		});
	}

    // Check if user exists
    if (!user) {
        return response.status(404).json({
            error: 'User not found.'
        });
    }

    // Check if exercise exists
    const exercise = await Exercise.findById(exerciseId).populate("user", { exercises: 0, workouts: 0 });

    if (!exercise) {
        return response.status(404).json({
            error: 'Exercise not found.'
        });
    }

    // Check if exercise name is already used.
    const existingExercise = user.exercises.find(exercise => exercise.name === name);
    if (existingExercise && (existingExercise.name !== exercise.name)) {
        return response.status(409).json({
            error: 'Exercise name must be unique.'
        });
    }

    // Check that the exercise name is valid.
    if (name.length < 6) {
        return response.status(400).json({
            error: 'Exercise name must be at least 6 characters long.'
        });
    }

    exercise.name = name;
    exercise.description = description;
    const savedExercise = await exercise.save();
    response.json(savedExercise);
});

exercisesRouter.delete('/:userId/exercises/:exerciseId', async (request, response) => {
    const exerciseId = request.params.exerciseId;
    const userId = request.params.userId;
    const user = await User.findById(userId).populate({
        path: "workouts",
		populate: [
			{ path: "exercises", populate: [
				{ path: "exercise" }
			]}
		]
    });

    // Check credentials
	if (!request.user || userId !== request.user.id.toString()) {
		return response.json({
			error: "Wrong credentials"
		});
	}

    // Check if user exists
    if (!user) {
        return response.status(404).json({
            error: 'User not found.'
        });
    }

    // Check if exercise exists
    const exerciseToBeDeleted = await Exercise.findById(exerciseId);

    if (!exerciseToBeDeleted) {
        return response.status(404).end();
    }

    // Check if exercise is currently being utilised in a workout.
    const workouts = user.workouts;
    for (let workout of workouts) {
        const exercises = workout.exercises;
        for (let exercise of exercises) {
            if (exercise.exercise._id.toString() === exerciseId) {
                return response.status(409).json({
                    error: 'Exercise currently utilised in existing workout.'
                })
            }
        }
    }

    await Exercise.findByIdAndDelete(exerciseId);
    user.exercises = user.exercises.filter(exercise => exercise._id != exerciseId);
    await user.save();
    response.status(204).end();
});

module.exports = exercisesRouter;