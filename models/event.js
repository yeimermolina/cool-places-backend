const { Schema, Types, model } = require("mongoose");

const eventSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  creator: {
    type: Types.ObjectId,
    required: true,
    ref: "User"
  }
});

module.exports = model("Event", eventSchema);
