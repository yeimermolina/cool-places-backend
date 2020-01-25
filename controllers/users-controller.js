const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users = [];
  try {
    users = await User.find({}, "-password");
  } catch (e) {
    return next(new HttpError("Something went wrong", 500));
  }

  res.status(200).json({
    users: users.map(user => user.toObject({ getters: true }))
  });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid input data", 422));
  }

  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (existingUser) {
    return next(new HttpError("User exists with that email", 422));
  }

  const user = new User({
    name,
    email,
    password,
    image: req.file.path,
    places: []
  });

  try {
    await user.save();
  } catch (e) {
    console.log(e);
    return next(new HttpError("Unable to create user, please try again", 500));
  }

  res.status(201).json({
    user: user.toObject({ getters: true })
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(new HttpError("Invalid email or password", 401));
  }

  res.json({
    user: existingUser.toObject({ getters: true })
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
