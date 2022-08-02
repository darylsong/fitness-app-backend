require("dotenv").config();
const http = require("http");
const express = require("express");
require('express-async-errors');
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const middleware = require("./utils/middleware");

//const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const registerRouter = require("./controllers/register")
const exercisesRouter = require("./controllers/exercises");
const workoutsRouter = require("./controllers/workouts");

const mongoURL = process.env.MONGODB_URI;
mongoose.connect(mongoURL).then(() => console.log('MongoDB has connected successfully.'));

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

//app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);
app.use("/api/register", registerRouter);
app.use("/api/users", middleware.userExtractor, exercisesRouter);
app.use("/api/users", middleware.userExtractor, workoutsRouter);

app.use("/api/", middleware.unknownEndpoint);
app.use("/api/", middleware.errorHandler);

module.exports = app;