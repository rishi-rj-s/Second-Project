
const mongose = require('mongoose')

const cartModel = mongose.Schema({
    user: {
        type: mongose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }, 
    products : [{
        productId: {
            type: mongose.Types.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            min : 1,
            max : 5,
            required: true,
            default: 1
        }
    }]
})


const cart = mongose.model('cart', cartModel)

module.exports = cart