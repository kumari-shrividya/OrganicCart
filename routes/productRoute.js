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


//multer
const multer=require('multer');
const sharp=require('sharp');
const path=require('path');

//upload product image to memory storage for edit image
const storageProd=multer.memoryStorage();
const uploadprod=multer({storage:storageProd});

//load user product list search
 product_route.post('/user_Products_FilterSearch',productController.getAllProducts);

//load user product list search
product_route.post('/filterProductsByCategory',productController.filterProductsByCategory);

// product_route.get('/filterProductsByCategory',productController.filterProductsByCategory);
 //load user home product list
  product_route.get('/user_Products_Search',productController.loadUser_Product_Search);

 //load product details
 product_route.get('/details/:id',productController.getProductDetails);

 //delete product image
 product_route.get('/deleteImage/:id',productController.deleteImage);

 //load add coupon
 product_route.get('/addCoupon',couponController.loadCoupon);
 //post add coupon
//  product_route.post('/addCoupon',validation.couponValidationRules(), async (req,res,next)=>{
//     var errors=validationResult(req);
//     const data = matchedData(req);
//     console.log(errors);
//     if (errors.isEmpty()) {  return next();    }
//     if(!errors.isEmpty()){
//         try{
            
//             return res.render('product',{addCoupon,errors:errors.mapped(),data:data});
//         }catch(error){
//             console.log(error);
//         }
//     }
// }
//  ,couponController.addCoupon);

product_route.post('/addCoupon',couponController.addCoupon);

//load coupon list
product_route.get('/couponList',couponController.loadCouponList);

//load edit coupon
product_route.get('/editCoupon/:id',couponController.loadEditCoupon);

//edit coupon
product_route.put('/editCoupon/:id',couponController.editCoupon);

//delete coupon
product_route.get('/deleteCoupon/:id',couponController.deleteCoupon);



//edit product image
//post category ,multer to upload ,sharp to resize, and express-validator 
// product_route.get('/editImage/:id',uploadprod.single('image'),
// async(req,res,next)=>{
// req.session.prodFileName=Date.now()+'_'+req.file.originalname;
// try{
//     await sharp(req.file.buffer)
//     .resize({width:250,height:225})
//     .jpeg
//     .toFile('./public/images/product/'+req.session.prodFileName);
//    next();
// }catch(error){
//     console.log(error);
// }

// }, productController.editProductImage);

//export
module.exports= product_route