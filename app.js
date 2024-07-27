const express = require('express');
const bodyParser = require('body-parser');
const placesRoutes = require("./routers/places-routes");

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes)

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }
    res.status(error.code || 500).json({message: error.message || 'An unknown error occcured'})
})

app.listen(5000)