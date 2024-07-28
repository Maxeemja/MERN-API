const HttpError = require("../models/http-error");
const uuid = require('uuid')

let DUMMY_USERS = [{id: 'u1', name: 'MXMJ', email: 'test@gmail.com', password: '1234'}]
const getUsers = (req, res, next) => {
    res.json({users: DUMMY_USERS})
}
const signup = (req, res, next) => {
    const {name, email, password} = req.body;

    const hasUser = DUMMY_USERS.find(u => u.email === email)

    if (hasUser) {
        throw new HttpError('Email already exists', 422)
    }

    const createdUser = {
        id: uuid.v4(), name, email, password
    }
    DUMMY_USERS.push(createdUser);
    res.status(201).json({user: createdUser})
}

const login = (req, res, next) => {
    const {email, password} = req.body;
    const identified = DUMMY_USERS.find(u => u.email === email)
    if (!identified || identified.password !== password) {
        throw new HttpError('Could not identify user', 401)
    }
    res.json({message: 'Logged in'})
}


module.exports = {getUsers, signup, login};