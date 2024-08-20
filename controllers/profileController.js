const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const addressModel = require('../models/addressModel')
const walletHistoryModel = require('../models/walletHistoryModel')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken')


exports.profile = async (req, res) => {
    // Extract the JWT token from the cookies
    try {

        if (req.user) {
            res.render('user/profile/Profile', { user });
        } else {
            res.redirect('/?msg=nouser')
        }
    } catch (ex) {
        return res.status(400).send('Invalid Token: ' + ex.message);
    }
};

exports.address = async (req, res) => {
    try {
        let user = req.user;
        if (!user) {
            res.redirect('/?msg=nouser');
        }
        const vilasam = await addressModel.find({ user: user._id })

        return res.render('user/profile/Address', { user, vilasam });
    } catch (ex) {
        return res.status(400).send('Invalid Token: ' + ex.message);
    }
};

exports.addAdress = async (req, res) => {
    try {
        let user = req.user;

        if (!user) {
            return res.status(400).send('No user logged in!');
        }

        const { name, mobileNumber, pincode, locality, address, district, state, landmark, alternateMobile } = req.body

        const addAddress = new addressModel({
            user: user._id,
            name, mobileNumber, pincode, locality, address, district, state, landmark, alternateMobile
        })

        addAddress.save()
            .catch((err) => {
                console.log(err)
            })

        res.redirect('/user/address')

    } catch (ex) {
        return res.status(400).send('Invalid Token: ' + ex.message);
    }
}


exports.deleteAddress = async (req, res) => {
    try {
        if (req.user) {
            const id = req.params.id
            let response = await addressModel.findByIdAndDelete(id)
            if (!response) {
                console.log("error in finding the user")
                res.status(500).json({ message: 'Server Error' })
            } else {
                console.log("SUcess")
                res.status(200).json({ message: "success" })
            }
        } else {
            console.log("No user");
            res.status(200).json({ message: 'nouser' })
        }
    } catch (e) {
        console.log(e)
        res.status(500).send("Failed to delete")
    }
}

exports.editAddress = async (req, res) => {
    try {
        if (!req.user) {
            res.redirect('/?msg=nouser');
        }
        const id = req.params.id
        const dbData = await addressModel.findOne({ _id: id })
        res.render('user/profile/editAddress', dbData)
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: "update data page render error" })
    }
}

exports.updateAddress = async (req, res) => {
    const token = req.cookies.userJwtAuth;

    if (!token) {
        return res.status(401).send('Access Denied: No Token Provided!');
    }

    // console.log(token + " this is the token");

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, 'secret_key'); // Use the same secret key used to sign the token
        console.log(decoded.email + " this is the decoded ");

        // Find the user in the database using the decoded email
        const user = await userModel.findOne({ email: decoded.email });
        // console.log(user + " this is the user");

        if (!user) {
            return res.status(400).send('User not found');
        }

        const { name, mobileNumber, pincode, locality, address, district, state, landmark = '', alternateMobile = '' } = req.body;
        console.log(req.body.name)

        const response = await addressModel.findOneAndUpdate({ user: user._id }, { name, mobileNumber, pincode, locality, address, district, state, landmark, alternateMobile }, { new: true })

        if (!response) {
            console.log("not updated")
            res.status(500).json({ message: " not updated" })
        } else {
            res.redirect('/user/address')
        }

    } catch (ex) {
        return res.status(400).send('Invalid Token: ' + ex.message);
    }
}


exports.orders = async (req, res) => {
    try {
        let user = req.user;
        if (!user) {
            res.redirect('/?msg=nouser');
        }
        const orders = await orderModel.find({ userId: user._id }).populate('items.productId').sort({ orderedDate: -1 });

        res.render('user/profile/myOrders', { orders, user })
    } catch (ex) {
        return res.status(400).send('Invalid Token: ' + ex.message);
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        if (!req.user) {
            res.status(400).send("No user logged in!");
        }
        const id = req.params.id

        const response = await orderModel.findByIdAndUpdate(id, {
            status: "Cancelled",
            paymentStatus: "Refunded"
        }, { new: true })

        const token = req.cookies.userJwtAuth;
        const decoded = jwt.verify(token, 'secret_key');

        const amount = await orderModel.findOne({ _id: id })

        console.log(amount + " this is the order model document")

        const user = await userModel.findOneAndUpdate(
            { email: decoded.email },
            { $inc: { wallet: +amount.totalAmount } }, // Ensure +id.totalamount is a valid number
            { new: true } // To return the updated document
        );

        await walletHistoryModel.findOneAndUpdate(
            { userId: req.user._id },
            { $push: { history: { amount: amount.totalAmount, type: 'credit', walletBalance: user.wallet } } },
            { new: true, upsert: true }
        )

        if (response) {
            res.json({ message: "Success" })
        }

    } catch (e) {
        console.log("error" + e)
        res.status(500).json({ message: "fail" })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        let user = req.user;
        if(!user){
            res.status(500).send("No user logged in!");
        }
        const newName = req.body.name
        console.log(newName)

        const response = await userModel.findByIdAndUpdate(user._id, {
            name: newName
        }, { new: true })

        if (response) {
            res.status(200).json({ message: "success" })
        } else {
            res.status(500).json({ message: "fail" })
        }
    } catch (e) {
        console.log(e.message);
        res.status(500).send("Internal Error!")
    }
}

exports.walletHistory = async (req, res) => {
    try {
        if(!req.user){
            res.redirect('/user/login?msg=loggin');
        }
        const response = await walletHistoryModel.findOne({ userId: req.user._id });
        const user = req.user
        console.log(response + " this is the response")
        if (user) {
            if (!response || response.history.length === 0) {
                res.render('user/profile/walletHistory', { response: false, user });
            } else {
                response.history.sort((a, b) => b.dateCreated - a.dateCreated)
                res.render('user/profile/walletHistory', { response: response, user });
            }
        }

    } catch (error) {
        // Handle error (optional)
        console.error('Error fetching wallet history:', error);
        res.status(500).send('Internal Server Error');
    }
}


