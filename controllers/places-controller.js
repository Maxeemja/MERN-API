const HttpError = require("../models/http-error");
const uuid = require("uuid");
const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");

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
const getPlaceById = (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!place) {
    throw new HttpError("Could not find a place for provided id.", 404);
  }
  res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
  const uid = req.params.uid;
  const userPlaces = DUMMY_PLACES.filter((p) => p.creator === uid);
  if (!userPlaces.length) {
    throw new HttpError("Could not find places for provided user id.", 404);
  }
  res.json({ userPlaces });
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

  // const title = req.body.title;
  const createdPlace = {
    id: uuid.v4(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace); //unshift(createdPlace)

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
