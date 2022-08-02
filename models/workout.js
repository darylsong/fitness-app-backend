const mongoose = require('mongoose');

const weightSchema = new mongoose.Schema({
    weight: {
        type: Number
    },
    unit: {
        type: String,
        enum: ["kg", "lb"]
    }
}, { _id : false });

const workoutSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true
    },
    exercises: [
        {
            _id: false,
            exercise: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Exercise"
            },
            sets: {
                type: Number,
                required: true
            },
            reps: {
                type: Number,
                required: true
            },
            weight: {
                type: weightSchema,
                required: false
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

workoutSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id;
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

const Workout = mongoose.model('Workout', workoutSchema);
module.exports = Workout;