const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const Event = require("../models/event");
const User = require("../models/user");

const createEvent = async (req, res, next) => {
  const { date, title } = req.body;

  const event = new Event({
    date,
    title,
    creator: req.user.id
  });

  try {
    user = await User.findById(req.user.id);
  } catch (e) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!user) {
    return next(new HttpError("User does not exists", 500));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await event.save({ session });
    user.events.push(event);
    await user.save({ session });
    await session.commitTransaction();
  } catch (e) {
    return next(new HttpError("Unable to create event, please try again", 500));
  }

  res.status(201).json({
    event: event.toObject({ getters: true })
  });
};

const getUserEvents = async (req, res, next) => {
  const { month, year } = req.query;
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month + 1, 0);
  let events;
  try {
    user = await User.findById(req.user.id);
  } catch (e) {
    return next(new HttpError("Something went wrong", 500));
  }

  try {
    events = await Event.find({
      creator: req.user.id,
      date: {
        $gte: firstDay,
        $lte: lastDay
      }
    });
  } catch (e) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!events) {
    return next(new HttpError("There are no events", 500));
  }

  res.json({
    events: events.map(event => event.toObject({ getters: true }))
  });
};

const editEvent = async (req, res, next) => {
  const { eventId } = req.params;
  const { title } = req.body;
  let event;
  try {
    event = await Event.findById(eventId);
  } catch (e) {
    return next(new HttpError("Something went wrong", 500));
  }

  if (!event) {
    return next(new HttpError("Appointment Not Found", 404));
  }

  event.title = title;

  try {
    await event.save();
  } catch (e) {
    return next(new HttpError("Something went wrong", 500));
  }

  res.status(200).json({
    event: event.toObject({ getters: true })
  });
};

exports.createEvent = createEvent;
exports.editEvent = editEvent;
exports.getUserEvents = getUserEvents;
