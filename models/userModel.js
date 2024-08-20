const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    wallet: { type: Number, default: 0, required: true },
    status: { type: Boolean, default: true },
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;