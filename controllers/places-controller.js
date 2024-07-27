const HttpError = require("../models/http-error");
const uuid = require('uuid')
const DUMMY_PLACES = [{
    id: 'p1', title: 'EmpireStateBuilding', description: 'Some descr', location: {
        lat: 40.748, long: -73.98715
    }, address: '20 W 34th Street, New York, NY 10001', creator: 'u1'
}]


const getPlaces = (req, res, next) => {
    res.json({DUMMY_PLACES})
}
const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(p => p.id === placeId);
    if (!place) {
        throw new HttpError('Could not find a place for provided id.', 404);
    }
    res.json({place})
}

const getPlaceByUserId = (req, res, next) => {
    const uid = req.params.uid;
    const userPlaces = DUMMY_PLACES.filter(p => p.creator === uid);
    if (!userPlaces.length) {
        throw new HttpError('Could not find places for provided user id.', 404)
    }
    res.json({userPlaces});
}

const createPlace = (req, res, next) => {
    const {title, description, coordinates, address, creator} = req.body;
    const createdPlace = {
        id: uuid.v4(), title, description, location: coordinates, address, creator
    }
    DUMMY_PLACES.push(createdPlace);
    res.status(201).json(createdPlace);
}

module.exports = {getPlaceById, getPlaceByUserId, createPlace, getPlaces};