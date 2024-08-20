const express = require('express')
const route = express.Router()
const controller = require('../controllers/adminController')
const salesreportController = require('../controllers/reportController')
const upload = require('../controllers/multer'); 
const multer = require('multer')

route.get('/', controller.dashBoard);
route.post('/login', controller.login); 
route.get('/logout', controller.logout);

route.get('/users', controller.manageUsers)

//offers route
route.get('/offers', controller.offers)
route.post('/updateOffers', controller.updateOffers)
route.get('/deleteOffer/:id', controller.deleteOffer)

//coupons route
route.get('/coupon', controller.coupon)
route.post('/addCoupon', controller.addCoupon)
route.delete('/deleteCoupon/:id', controller.deleteCoupon)
route.get('/changeCouponStatus/:id', controller.changeCouponStatus)

route.get('/products', controller.adminProducts);
route.get('/listProduct/:id', controller.listProduct);
route.get('/category', controller.adminCategory)

route.get('/addcategory', controller.addcategory)
route.patch('/editCategory', controller.updateCategory)
route.get('/editCategory/:id', controller.editCategory)

route.delete('/product/:id', controller.deleteProduct)
route.delete('/category/:id', controller.deleteCategory)

route.get('/addproducts', controller.addproducts)

route.get('/adminLogin', controller.adminLogin)

// route.get('/logout', controller.logout)

///API

route.post('/usertoggle/:userId', controller.toggleUser);

route.post('/addProducts', upload.array("images", 3),controller.addProducts)

route.get('/editProduct/:id',controller.renderEdit);
route.patch('/editProduct', controller.updateProduct);

route.post('/addCategory',controller.addCategory)

route.get('/manageOrders',controller.manageOrders);
route.get('/manageOrdersPagination/:pageNumber',controller.manageOrdersPagination);

route.patch('/deliverOrder/:id',controller.deliverOrder);

route.post('/salesreport',salesreportController.generatereport)
route.post('/generateChart',salesreportController.generateChart)

module.exports = route