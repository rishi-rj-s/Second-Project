const mongoose = require('mongoose');

const wishListModel = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref : 'users'
    },
    products: [{
        productId: {
            type: mongoose.Types.ObjectId,
            ref: 'product',
            required: true
        }
    }],
   })

const wishList = new mongoose.model('wishlist', wishListModel)

module.exports = wishList
