const Category = require('../models/categoryModel')
const Product = require('../models/productModel')
const userModel = require('../models/userModel')
const orderModel = require('../models/orderModel')
const couponModel = require('../models/couponModel')
const cartModel = require('../models/cartModel')
const addressModel = require('../models/addressModel')
const walletHistoryModel = require('../models/walletHistoryModel')
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');


exports.loginPage = (req, res) => {
    try {
        let user = req.user;
        if (!user) {
            res.render('user/login');
        } else {
            res.redirect('/');
        }
    } catch (e) {
        console.log(e.message);
        res.status(500).send("Internal Error!");
    }
}

exports.forgot = async (req, res) => {
    try {
        if (req.user) {
            const userEmail = req.user.email;
            if (!req.user.password) {
                return res.redirect('/user/profile?msg=noPass');
            }
            return res.render('user/forgotPassword', { user: userEmail });
        } else {
            return res.render('user/forgotPassword', { user: "loggedout" });
        }
    } catch (e) {
        console.log(e.message);
        res.status(500).send("Internal Error!")
    }
}

exports.api_login = async (req, res) => {
    try {
        if(req.user){
            res.redirect('/?msg=inside');
        }
        let { email, password } = req.body;
        console.log(email, password);
        
        const user = await userModel.findOne({ email: email });
        console.log(user);

        if (!user) {
            return res.redirect('/user/login?msg=email'); // No user found with the given email
        }

        if (!user.status) {
            return res.redirect('/?msg=blocked');
        }

        if (user.password === password) {
            const token = { email: email };
            const userToken = jwt.sign(token, "secret_key", {
                expiresIn: '50m'
            });

            res.cookie('userJwtAuth', userToken, {
                httpOnly: true,
                maxAge: 4 * 60 * 60 * 1000 // 4 hours in milliseconds
            });

            return res.redirect('/?msg=success');
        } else {
            return res.redirect('/user/login?msg=password'); // Password does not match
        }
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).send('Internal Server Error');
    }
};

exports.logout = async (req, res) => {
    try {
        let user = req.user;
        if (user) {
            res.clearCookie('userJwtAuth');
            res.redirect('/?msg=loggedout');
        } else {
            res.redirect('/?msg=nouser')
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("Error");
    }
}

exports.signup = (req, res) => {
    try {
        let user = req.user;
        if (user) {
            res.redirect('/?msg=inside')
        } else {
            res.render('user/signup');
        }
    } catch (e) {
        console.log(e);
        res.status(500).send("Internal Error!");
    }
}

exports.sendOtp = (req, res) => {
    try {

        if(req.user){
            res.status(500).json({error: "User logged in!"});
        }

        console.log("Triggered! back")
        let email = req.body.email;
        console.log(email + "back");

        // otp verification
        const transport = {
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "jaisonsilva303@gmail.com",
                pass: "bolg wysf cirq dxsa"
            }
        }

        const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
        // console.log(otp);

        let transporter = nodemailer.createTransport(transport);
        const mailContent = {
            from: "jaisonsilva303@gmail.com",
            to: `${email}`,
            subject: "This is the otp for the sign up for RISHI STUDIO",
            text: `Your otp is: ${otp}`
        }

        transporter.sendMail(mailContent, (err) => {
            if (err) {
                console.log(otp);
                console.error(err);
                res.status(500).json({ error: 'Failed to send OTP' }); // Send an error response
            } else {
                // Store the OTP in session or database
                console.log(otp);
                res.cookie('otp', otp, { maxAge: 30000, httpOnly: true })
                res.status(200).json({ message: 'OTP sent successfully' }); // Send a success response
            }
        });
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
};

exports.updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = req.user;

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.verifyOtp = (req, res) => {
    try {
        if(req.user){
            res.status(500).json({error: 'User logged in!'});
        }
        let { otp } = req.body;
        console.log('Triggered verifyOtp with OTP:', otp);

        const storedOtp = req.cookies.otp;

        if (!storedOtp) {
            console.log('expired')
            return res.status(200).json({ message: "Expired" });
        }

        if (otp === storedOtp) {
            console.log('veri')
            return res.status(200).json({ message: "Verified" });
        } else {
            console.log('invvalid')
            return res.status(200).json({ message: "Invalid" });
        }
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
};

exports.registerUser = async (req, res) => {
    try {
        if (user) {
            res.redirect('/?msg=inside')
        }
        let { name, email, password } = req.body;
        const data = new userModel({ name, email, password });

        await data.save();
        console.log("Data saved to DB");
        res.clearCookie('otp');

        const token = {
            email: email
        }

        const userToken = jwt.sign(token, "secret_key", {
            expiresIn: ''
        });

        res.cookie('userJwtAuth', userToken, {
            httpOnly: true,
            maxAge: 4 * 60 * 60 * 1000 // 4 hours in milliseconds
        });

        res.redirect('/');
    } catch (err) {
        console.error("There was an error saving the data: ", err);
        res.status(500).send("There was an error saving the data");
    }
}

exports.products = async (req, res) => {
    try {
        let user = req.user;
        const data = await Product.find({ listing: true }).populate('category')
        // console.log(data);
        res.render('user/products', { data, user })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
}

exports.cate_products = async (req, res) => {
    try {
        let user = req.user;
        const data = await Product.find({ category: req.params.id, listing: true }).populate('category')
        // console.log(data);
        res.render('user/products', { data, user })
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
}

exports.productDetailed = async (req, res) => {
    try {
        let user = req.user;

        const data = await Product.findById(req.params.id).populate('category');
        const similar = await Product.find({ listing: true }).populate('category').limit(4);

        if (!data || data.listing === false) {
            return res.redirect('/?msg=noexists');
        }

        res.render('user/productDetailed', { data, user, similar });
    } catch (err) {
        console.log(err)
        res.status(500).send(err)
    }
}


exports.placeOrder = async (req, res) => {
    try {
        let user = req.user;
        if (!user) {
            res.redirect('/?msg=nouser')
        }
        const { couponId, addressId, cartId, PaymentMethod, paymentStatus } = req.body;
        console.log(couponId + "_  this is the coupon id");
        console.log(paymentStatus + "_  this is the paymentstatus id");

        const authCouponId = couponId === "null" ? null : couponId;

        const [usercart, address, coupon] = await Promise.all([
            cartModel.findById(cartId).populate("products.productId"),
            addressModel.findById(addressId),
            authCouponId ? couponModel.findById(couponId) : Promise.resolve(null),
        ]);

        console.log(coupon + "_  this is the coupon");

        const orderedItems = usercart.products.map((item) => {
            return {
                productId: item.productId,
                price: item.productId.rate,
                quantity: item.quantity,
            };
        });

        let totalAmount = 0;
        usercart.products.forEach(item => {
            totalAmount += item.productId.rate * item.quantity;
        });

        if (coupon) {
            const discount = (totalAmount * coupon.discountPercentage) / 100;
            totalAmount -= discount;
        }

        if (PaymentMethod === "Rishi Studio Wallet") {
            console.log("wallet debit triggered");

            const updatedUser = await userModel.findOneAndUpdate(
                { _id: user._id },
                { $inc: { wallet: -totalAmount } },
                { new: true }
            );

            console.log(updatedUser + " this is the return from the wallet balance update");

            const walletUpdate = await walletHistoryModel.findOneAndUpdate(
                { userId: user._id },
                { $push: { history: { amount: totalAmount, type: 'debit', walletBalance: updatedUser.wallet } } },
                { new: true, upsert: true }
            );

            if (!updatedUser || !walletUpdate) {
                throw new Error("Failed to update wallet balance" + updatedUser + walletUpdate);
            }
            console.log("Wallet updated successfully:", updatedUser);
        }

        const order = new orderModel({
            userId: user._id,
            name: address.name,
            items: orderedItems,
            totalAmount: totalAmount,
            shippingAddress: address._id,
            paymentMethod: PaymentMethod,
            paymentStatus,
        });

        await order.save();

        // Delete the cart
        await cartModel.findByIdAndDelete(cartId);

        return res.render('user/orderPlaced', { user: true, paymentStatus });
    } catch (e) {
        console.log(e);
        res.status(500).send("Error: " + e);
    }
}

exports.filterSort = async (req, res) => {
    try {
        let user = req.user
        const popularProducts = await Product.find({ listing: true })
            .sort({ rating: -1 })
            .limit(4)
            .populate('category');

        const { search = '', sort = 'objectId', filter = [], limit = 5 } = req.query;
        let { page = 1 } = req.query;

        const filters = Array.isArray(filter) ? filter : filter ? [filter] : [];

        const category = await Category.find({ listing: true });

        const sortOptions = {
            price_lowtohigh: { rate: 1 },
            price_hightolow: { rate: -1 },
            name_lowtohigh: { name: 1 },
            name_hightolow: { name: -1 },
            objectId: { _id: -1 }
        };

        const sortCriteria = sortOptions[sort] || sortOptions.objectId;

        const query = {
            name: { $regex: search, $options: 'i' },
            listing: true
        };

        if (filters.length > 0) {
            query.category = { $in: filters };
        }

        const total = await Product.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        page = Math.max(1, Math.min(totalPages, parseInt(page)));

        const products = await Product.find(query)
            .populate('category')
            .sort(sortCriteria)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.render('user/category', {
            user,
            products,
            currentPage: parseInt(page),
            totalPages,
            searchQuery: search,
            selectedFilters: filters,
            selectedSort: sort,
            category,
            popularProducts
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("An error occurred while processing your request.");
    }
};

exports.retryPayment = async (req, res) => {
    try{
        if(!req.user){
            res.status(500).json({error: 'NO user logged in!'});
        }
        const id = req.params.id
        await orderModel.findByIdAndUpdate(id, { paymentStatus: "Completed" })
            .then(() => {
                res.json({ mission: "successfull" })
            })
            .catch((E) => {
                console.log(E)
                res.status(500).send(E)
            })
    
    }catch(e){
        console.log(e.message);
        res.status(500).send("Internal Error!");
    }
}