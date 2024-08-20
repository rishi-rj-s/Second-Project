const mongoose = require('mongoose');

const Products_schema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Make name mandatory
    },
    description: {
        type: String,
        required: true // Make description mandatory
    },
    rating: {
        type: Number,
        min : 0,
        max : 10,
        required: true // Make rating mandatory
    },
    rate: {
        type: Number,
        required: true // Make rate mandatory
    },
    rateTemp: {
        type: Number,
        required: true,
        default: 0
    },
    offerApplied: {
        type: Boolean,
        required: true,
        default: false
    },
    offerPercentage : {
        type : Number,
        required : false
    },
    listing: {
        type: Boolean,
        default: true // Default value is true if not provided
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category',
        required: true // Make category mandatory
    },
    images: {
        type: [String],
        minlength: 3,
        maxlength: 3,
        required: [true, "3 images are required"],
    }
});

const Product = mongoose.model('product', Products_schema);

module.exports = Product;
