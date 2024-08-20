const express = require('express')
const route = express.Router()
const googleController = require('../controllers/googleSetup')

const controller = require('../controllers/userController')
const profileController = require('../controllers/profileController')
const wishlistControler = require('../controllers/wishlistControler')
const cartController = require('../controllers/cartController')
const reportController = require('../controllers/reportController')

const checkUser = require('../middleware/checkUser.js');


route.get('/login', checkUser, controller.loginPage)
route.get('/logout', checkUser, controller.logout)
route.get('/signup', checkUser, controller.signup)
route.get('/forgot', checkUser, controller.forgot)
route.patch('/updatePassword', checkUser, controller.updatePassword)

route.get('/products',checkUser , controller.products)

route.get('/category/products/:id',checkUser , controller.cate_products)

route.get('/productDetailed/:id',checkUser, controller.productDetailed) 

route.post('/registerUser', checkUser, controller.registerUser)

route.delete('/deleteAddress/:id', checkUser, profileController.deleteAddress)

route.delete('/deleteProduct/:id', checkUser, cartController.deleteProduct)

route.get('/filterSort',checkUser, controller.filterSort )

route.get('/category',checkUser ,controller.filterSort)

route.get('/invoice/:id',checkUser, reportController.generateInvoice)
 
route.get('/profile'  ,checkUser, profileController.profile)

route.get('/address'  ,checkUser, profileController.address)

route.get('/orders'  ,checkUser, profileController.orders)

route.patch('/cancelOrder/:id', checkUser,  profileController.cancelOrder)

route.post('/addAddress', checkUser, profileController.addAdress)

route.get('/editAddress/:id', checkUser, profileController.editAddress)

route.patch('/updateAddress', checkUser, profileController.updateAddress)

route.patch('/updateProfile', checkUser, profileController.updateProfile)


/// API

route.post('/sendOtp', checkUser, controller.sendOtp)
route.post('/verifyOtp', checkUser, controller.verifyOtp)
route.post('/api_login', checkUser, controller.api_login)

route.get("/google", checkUser, googleController.googleAuth)

route.get("/retryPayment/:id",checkUser, controller.retryPayment)

route.get("/redirect", googleController.googleRedirect)

// Wishlist Routes
route.get('/viewWishlist', checkUser, wishlistControler.viewWishlist)
route.post('/addToWishList', checkUser, wishlistControler.addToWishList)
route.delete('/deleteFromWishList/:id', checkUser, wishlistControler.deleteFromWishList)


// Cart Routes
route.get('/viewCart', checkUser, cartController.viewCart)
route.post('/addToCart', checkUser, cartController.addToCart)
route.post('/updateQuantity' , checkUser, cartController.updateQuantity);
route.get('/getCouponData/:id', checkUser, cartController.getCouponData);

route.get('/checkout', checkUser, cartController.renderCheckout)
route.post('/placeOrder', checkUser, controller.placeOrder);

//Wallet History Routes
route.get('/walletHistory',checkUser, profileController.walletHistory)

module.exports = route