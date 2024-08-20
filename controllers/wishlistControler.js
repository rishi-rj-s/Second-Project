const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')
const wishListModel = require('../models/wishlistModel')

exports.viewWishlist = async (req, res) => {
    try {
        // res.send("Hi" + req.user)
        const data = await wishListModel.findOne({ user: req.user._id }).populate('products.productId')
        // console.log(data + "this is the model")
        res.render('user/wishList', { wishList: data, user: true })
    } catch (e) {
        console.log(e)
    } 
}

exports.addToWishList = async (req, res) => {
    try {
        if(!req.user){
            res.json({message: "nouser"})
        }
        const productId = req.body.productId;
        let wishList = await wishListModel.findOne({ user: req.user._id });

        if (!wishList) {
            wishList = new wishListModel({
                user: req.user._id,
                products: [{ productId }]
            });
        } else {
            const exists = wishList.products.some(product => product.productId.toString() === productId);

            if (exists) {
                return res.json({ message: "exists" });
            } else {
                wishList.products.push({ productId });
            }
        }

        await wishList.save();
        res.json({ message: "added" });
        console.log("Product added to wishlist");
    } catch (e) {
        console.log(e);
        res.status(500).send(e.message);
    }
};


exports.deleteFromWishList = async (req, res) => {
    try {
        const productId = req.params.id
        // console.log(req.user._id + " user id")
        // console.log(productId + " product id")

        const response = await wishListModel.findOneAndUpdate({ user: req.user._id },
            { $pull: { products: { productId } } },
            { new: true } // Return the updated document
        )

        res.json({ message: "deleted" })
    } catch (error) {
        res.status(500).send(error)
    }
}