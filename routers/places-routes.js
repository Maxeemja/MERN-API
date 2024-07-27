const express = require('express');

const router = express.Router();
const {getPlaceById, getPlaceByUserId, createPlace, getPlaces} = require('../controllers/places-controller');

router.get('/', getPlaces)

router.get('/:pid', getPlaceById)

router.get('/user/:uid', getPlaceByUserId)

router.post('/', createPlace)

module.exports = router;