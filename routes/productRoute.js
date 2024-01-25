const express=require('express');
const product_route=express();

const session=require('express-session');
const config=require("../config/config");
product_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}))
const productController=require('../controllers/productController');

const auth=require("../middleware/auth")


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

 //load user home product list
  product_route.get('/user_Products_Search',productController.loadUser_Product_Search);

 //load product details
 product_route.get('/details/:id',productController.getProductDetails);

 //delete product image
 product_route.get('/deleteImage/:id',productController.deleteImage);

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