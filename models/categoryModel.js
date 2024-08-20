const mongoose = require('mongoose');


const Category_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Make name mandatory
    },
    description: {
        type: String,
        required: true // Make name mandatory
    },
    listing: {
        type: Boolean,
        default: true,
        required: true
    },
    rate: {
        type: Number,
        required: true // Make name mandatory
    }
})

const Category = new mongoose.model('category', Category_schema)


module.exports = Category