const mongoose = require('mongoose');


const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    locality: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },

    landmark: String,
    alternateMobile: String,

},{ timestamps: true }); // Adds createdAt and updatedAt fields



const addressModel = mongoose.model('address', addressSchema);


module.exports = addressModel