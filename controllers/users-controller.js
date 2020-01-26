const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (e) {
    return next(new HttpError("Could not create user", 500));
  }

  const user = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: []
  });

  try {
    await user.save();
  } catch (e) {
    console.log(e);
    return next(new HttpError("Unable to create user, please try again", 500));
  }

  let token;

  try {
    token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.PRIVATE_KEY,
      {
        expiresIn: "1h"
      }
    );
  } catch (e) {
    return next(new HttpError("Unable to create user, please try again", 500));
  }

  res.status(201).json({
    userId: user.id,
    email: user.email,
    token: token
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

  if (!existingUser) {
    return next(new HttpError("Invalid email or password", 401));
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (e) {
    return next(new HttpError("Server Error", 500));
  }

  if (!isValidPassword) {
    return next(new HttpError("Invalid Password", 422));
  }

  let token;

  try {
    token = jwt.sign(
      {
        userId: existingUser.id,
        email: existingUser.email
      },
      process.env.PRIVATE_KEY,
      {
        expiresIn: "1h"
      }
    );
  } catch (e) {
    return next(new HttpError("Server Error", 500));
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
