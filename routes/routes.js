const express = require('express')
const route = express.Router()
const controller = require('../controllers/controller');

route.get('/',controller.index)

module.exports = route