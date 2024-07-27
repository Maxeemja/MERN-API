const express = require('express');

const router = express.Router();
const {
    getPlaceById,
    getPlaceByUserId,
    createPlace,
    getPlaces,
    updatePlace,
    deletePlace
} = require('../controllers/places-controller');

router.get('/', getPlaces)

router.get('/:pid', getPlaceById)

router.get('/user/:uid', getPlaceByUserId)

router.post('/', createPlace)

router.patch('/:pid', updatePlace)

router.delete('/:pid', deletePlace)

module.exports = router;