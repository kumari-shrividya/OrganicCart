const express=require('express');
const product_route=express();


const {check , validationResult,matchedData} = require('express-validator');

//session
const session=require('express-session');
const config=require("../config/config");
product_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}));

//controller
const productController=require('../controllers/productController');
const couponController=require('../controllers/couponController');

//middleware
const validation=require("../middleware/validation")
const auth=require("../middleware/auth")

//view engine
product_route.set('view engine','ejs');
product_route.set('views','./views/product');

const bodyparser=require('body-parser');
product_route.use(bodyparser.urlencoded({extended:false}));
product_route.use(bodyparser.json());

//admin auth
const adminAuth=require('../middleware/adminAuth');

//multer
const multer=require('multer');
const sharp=require('sharp');
const path=require('path');

//upload product image to memory storage for edit image
const storageProd=multer.memoryStorage();
const uploadprod=multer({storage:storageProd});

// search products by name or description
 product_route.post('/user_Products_FilterSearch',productController.getAllProducts);

// filter  product  by category
product_route.post('/filterProductsByCategory',productController.filterProductsByCategory);

 //load  search page
  product_route.get('/user_Products_Search',productController.loadUser_Product_Search);

 //load product details
 product_route.get('/details/:id',productController.getProductDetails);

 //load add coupon
 product_route.get('/addCoupon',adminAuth.isLogin,couponController.loadCoupon);
 
product_route.post('/addCoupon',adminAuth.isLogin,couponController.addCoupon);

//load coupon list
product_route.get('/couponList',adminAuth.isLogin,couponController.loadCouponList);

//load edit coupon
product_route.get('/editCoupon/:id',adminAuth.isLogin,couponController.loadEditCoupon);

//edit coupon
product_route.put('/editCoupon/:id',adminAuth.isLogin,couponController.editCoupon);

//delete coupon
product_route.get('/deleteCoupon/:id',adminAuth.isLogin,couponController.deleteCoupon);

//export
module.exports= product_route