const mongoose = require('mongoose')

const schema = mongoose.Schema({
    username: String,
    email: String,
    password: String
})

const adminModel = mongoose.model('admins',schema);

module.exports = adminModel