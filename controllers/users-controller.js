const uuid = require("uuid/v4");
const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");

const USERS = [
  {
    id: "u1",
    name: "Yeimer",
    email: "yeimer@gmail.com",
    password: "123"
  }
];

const getUsers = (req, res, next) => {
  res.status(200).json({
    users: USERS
  });
};

const signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new HttpError("Invalid input data", 422);
  }

  const { name, email, password } = req.body;

  const hasUser = USERS.find(u => u.email === email);

  if (hasUser) {
    throw new HttpError("User Exists", 422);
  }

  const user = {
    id: uuid(),
    name,
    email,
    password
  };

  USERS.push(user);
  res.status(201).json({
    user
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  const user = USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new HttpError("Unable to identify user", 401);
  }

  res.json({
    user
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
