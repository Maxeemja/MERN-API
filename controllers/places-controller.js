const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");

let DUMMY_PLACES = [
  {
    id: "p1",
    title: "EmpireStateBuilding",
    description: "Some descr",
    location: {
      lat: 40.748,
      long: -73.98715,
    },
    address: "20 W 34th Street, New York, NY 10001",
    creator: "u1",
  },
];

const getPlaces = (req, res, next) => {
  res.json({ DUMMY_PLACES });
};
const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (e) {
    const error = new HttpError("Failed to get place", 500);
    return next(error);
  }

  if (!place) {
    return next(new HttpError("Could not find place for provided id.", 404));
  }

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const uid = req.params.uid;
  let userPlaces;

  try {
    userPlaces = await Place.find({ creator: uid });
  } catch (e) {
    const error = new HttpError("Fetching failed.", 500);
    return next(error);
  }

  if (!userPlaces.length) {
    return next(
      new HttpError("Could not find places for provided user id.", 404),
    );
  }

  res.json({ places: userPlaces.map((p) => p.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422),
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const createdPlace = new Place({
    title,
    description,
    image:
      "https://cdn.britannica.com/73/114973-050-2DC46083/Midtown-Manhattan-Empire-State-Building-New-York.jpg",
    address,
    location: coordinates,
    creator,
  });

  let user;
  try {
    user = await User.findById(creator);
  } catch (e) {
    const error = new HttpError("Creating place failed", 500);
    return next(error);
  }

  if (!user) {
    return next(new HttpError("Could not find user by provided id", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (e) {
    const error = new HttpError("Creating place failed", 500);
    return next(e);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid inputs passed", 422));
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;

  try {
    const options = { new: true };
    place = await Place.findByIdAndUpdate(
      placeId,
      { title, description },
      options,
    );
  } catch (e) {
    const error = new HttpError("Updating place failed", 500);
    return next(error);
  }

  res.json({ place });
};

const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  try {
    await Place.findByIdAndDelete(placeId);
  } catch (e) {
    const error = new HttpError("Deleting place failed", 500);
    return next(error);
  }
  res.json({ message: "Deleted place." });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  getPlaces,
  updatePlace,
  deletePlace,
};
