const workoutsRouter = require("express").Router();
const User = require("../models/user");
const Workout = require("../models/workout");

workoutsRouter.get("/:userId/workouts", async (request, response) => {
    const userId = request.params.userId;

	// Check credentials
	if (!request.user || userId !== request.user.id.toString()) {
		return response.json({
			error: "Wrong credentials"
		});
	}

    const user = await User.findById(userId).populate({
        path: "workouts",
        populate: [
            { path: "user", select: "-exercises -workouts" }
        ],
		populate: [
			{ path: "exercises", populate: [
				{ path: "exercise", select: "-user -description" }
			]}
		]
    });
    const workouts = user.workouts;
    response.json(workouts);
});


workoutsRouter.get('/:userId/workouts/:workoutId', async (request, response) => {
    const workoutId = request.params.workoutId;
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

    // Check if workout exists
    const workout = await Workout.findById(workoutId)
		.populate({ path: "user", select: "-exercises -workouts" })
		.populate({
			path: "exercises", populate: [
				{ path: "exercise", select: "-user -description" }
				]
			});
	
    if (!workout) {
        return response.status(404).end();
    }

    response.json(workout);
});

workoutsRouter.post("/:userId/workouts", async (request, response) => {
    const { exercises, date } = request.body;
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

	const exercisesToReturn = [];

	for (let exercise of exercises) {
		// Check if exercise already exists.
		const existingExercise = user.exercises.find(e => e._id.toString() === exercise.exercise);
		if (!existingExercise) {
			return response.status(400).json({
				error: 'Exercise not found.'
			});
		}

		// Create new exercise and add to list of exercises.
		const newExercise = {
			exercise: existingExercise.id,
			sets: exercise.sets,
			reps: exercise.reps,
            weight: exercise.weight
		}

		exercisesToReturn.push(newExercise);
	}

    const workout = new Workout({
        date,
        exercises: exercisesToReturn,
        user: user._id
    });

    const savedWorkout = await workout.save();
    user.workouts = user.workouts.concat(savedWorkout);
    await user.save();
    response.status(201).json(savedWorkout);
});

workoutsRouter.put('/:userId/workouts/:workoutId', async (request, response) => {
    const { exercises, date } = request.body;
    const workoutId = request.params.workoutId;
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

    // Check if workout exists
    const workout = await Workout.findById(workoutId)
		.populate({ path: "user", select: "-exercises -workouts" })
		.populate({
			path: "exercises", populate: [
				{ path: "exercise", select: "-user -description" }
				]
			});
	
    if (!workout) {
        return response.status(404).end();
    }

	const exercisesToReturn = [];

	for (let exercise of exercises) {
		// Check if exercise already exists.
		const existingExercise = user.exercises.find(e => e._id.toString() === exercise.exercise);
		if (!existingExercise) {
			return response.status(400).json({
				error: 'Exercise not found.'
			});
		}

		// Create new exercise and add to list of exercises.
		const newExercise = {
			exercise: existingExercise.id,
			sets: exercise.sets,
			reps: exercise.reps,
            weight: exercise.weight
		}

		exercisesToReturn.push(newExercise);
	}

    workout.date = date;
    workout.exercises = exercisesToReturn;
    const savedWorkout = await workout.save();
    response.json(savedWorkout);
});

workoutsRouter.delete('/:userId/workouts/:workoutId', async (request, response) => {
    const workoutId = request.params.workoutId;
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
    const workoutToBeDeleted = await Workout.findById(workoutId);

    if (!workoutToBeDeleted) {
        return response.status(404).end();
    }

    await Workout.findByIdAndDelete(workoutId);
    user.workouts = user.workouts.filter(workout => workout._id != workoutId);
    await user.save();
    response.status(204).end();
});

module.exports = workoutsRouter;