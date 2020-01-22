const axios = require("axios");
const HttpError = require("../models/http-error");

const API_KEY = "AIzaSyC9Fv-3f2CLbNnGSUXoXEpCj4n7hq6J3-E";

async function getCoordsFromAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for current address",
      422
    );
    throw error;
  }

  const coordinates = data.results[0].geometry.location;
  return coordinates;
}

module.exports = getCoordsFromAddress;
