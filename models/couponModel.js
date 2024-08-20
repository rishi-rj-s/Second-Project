const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    discountPercentage: {
        type: Number,
        required: true 
    },
    minimumPurchaseAmount: {
        type: Number, 
        required: true
    },
    isActive: {
        type: String,
        enum : ["Active","Expired","InActive"],
        required: true,
        default: "Active",
    },
    expiryDate :{
        type: Date,
        required: true,
    }
});

couponSchema.methods.isExpired = function() {
    return new Date() > this.expiryDate;
};

const couponModel = mongoose.model('coupon', couponSchema);

module.exports = couponModel;