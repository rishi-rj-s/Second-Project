const mongoose = require('mongoose')

const history = mongoose.Schema({
    userId: { type: mongoose.Schema.ObjectId, required : true },
    history: [{
        amount: { type: Number, required: true },
        type: { type: String, enum: ['debit', 'credit'], required: true },
        walletBalance :{type : Number, required : true},
        dateCreated: { type: Date, default: Date.now }
    }],
})

const data = mongoose.model('walletHistory', history)

module.exports = data