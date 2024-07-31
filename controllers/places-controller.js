const HttpError = require("../models/http-error");
const uuid = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");

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
    throw new HttpError("Could not find places for provided user id.", 404);
  }

  res.json({ places: userPlaces.map((p) => p.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    next(new HttpError("Invalid inputs passed, please check your data.", 422));
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

  try {
    await createdPlace.save();
  } catch (e) {
    const error = new HttpError("Creating place failed", 500);
    return next(error);
  }

  res.status(201).json({ place: createdPlace });
};

const updatePlace = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError("Invalid inputs passed", 422);
  }

  const { title, description } = req.body;
  const placeId = req.params.pid;
  const updatedPlace = {
    ...DUMMY_PLACES.find((p) => p.id === placeId),
    title,
    description,
  };

  DUMMY_PLACES = DUMMY_PLACES.map((p) => (p.id !== placeId ? p : updatedPlace));
  res.json({ place: updatedPlace });
};

const deletePlace = (req, res, next) => {
  const placeId = req.params.pid;
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);
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
