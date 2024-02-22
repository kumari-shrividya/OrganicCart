const express=require('express');
const admin_route=express();

//session
const session=require('express-session');
const config=require('../config/config');
admin_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}))

const adminController=require('../controllers/adminController');



//middleware
const adminAuth=require('../middleware/adminAuth');
const Category = require('../models/categoryModel');
const validation=require("../middleware/validation")

//express validator
const {check , validationResult,matchedData} = require('express-validator');

//view engine
admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');

//body parser
const bodyparser=require('body-parser');
admin_route.use(bodyparser.json());
admin_route.use(bodyparser.urlencoded({extended:true}));




//multer
const multer=require('multer');
const sharp=require('sharp');
const path=require('path');
const {uploadImages,resizeImages,uploadCategoryImage}=require('../util/imageUpload');
const{uploadImage,resizeImage}=require('../util/CategoryImageUpload')




const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){

        cb(null,true);
    }
    else{
       cb('Please upload images !',false);

           
    }
};
//upload category image to memory storage crop using sharp
const storagecat=multer.memoryStorage();
//const upload=multer({storage:storage});
// const uploadcat=multer({storage:storagecat,fileFilter:multerFilter});
const uploadcat=multer({storage:storagecat});


// //upload product image to memory storage for edit image
// const storageProd=multer.memoryStorage();
// const uploadprod=multer({storage:storageProd});

admin_route.get('/login',adminController.loadAdminLogin);
admin_route.post('/login',adminController.verifyAdminLogin);
//load amin panel
admin_route.get('/home',adminAuth.isLogin,adminController.loadAdminHome);

//admin logout
admin_route.get('/logout',adminController.adminLogout);

//load dashboard
admin_route.get('/dashboard',adminAuth.isLogin,adminController.loadAdminDashboard);

//load chart

admin_route.get('/getChartData',adminController.getChartData);



//load userList
admin_route.get('/userList',adminAuth.isLogin,adminController.loadUserList);
//show user Address
admin_route.get('/userAddress/:id',adminAuth.isLogin,adminController.loadUserAddress);
//user Details
admin_route.get('/userDetails/:id',adminAuth.isLogin,adminController.loadUserDetails);
//block user
admin_route.get('/blockUser/:id',adminAuth.isLogin,adminController.blockUser);
//unbloc user
admin_route.get('/unblockUser/:id',adminAuth.isLogin,adminController.unblockUser);
//load add category
admin_route.get('/category',adminAuth.isLogin,adminController.loadCategory);

//post category ,multer to upload ,sharp to resize, and express-validator 
admin_route.post('/category',uploadcat.single('image'),
async(req,res,next)=>{
 try{
    // if(!file.mimetype.startsWith('image')){



    // }


    let fileName=req.file.originalname.replace(/\..+$/,'');
     fileName=req.file.originalname.split(' ').join('-');
    const imageUrl=`${fileName}-${Date.now()}.jpeg`;
    //console.log(imageUrl);
    const processedImageBuffer= await sharp(req.file.buffer)
    .resize({width:250,height:225})
    .toFormat('jpeg')
    .toFile('./public/images/category/'+imageUrl);  
     req.session.fileName=imageUrl;
   // console.log(req.session.fileName);
   next();
}catch(error){
   // console.log(error); 
   return res.status(500).send(error);
}

},
[
check('title').trim().notEmpty().withMessage(" category Name is required")
],
 (req,res,next)=>{
    var errors=validationResult(req);
    const data = matchedData(req);
    //console.log(errors);
    if (errors.isEmpty()) {
     return next();
    next();
    }
    if(!errors.isEmpty()){
        try{
            return res.render('category',{errors:errors.mapped(),data:data});
        }catch(error){
            console.log(error);
        }
    }
},adminController.addCategory
);

//list category
admin_route.get('/categoryList',adminController.loadCategoryList);
//edit category
admin_route.get('/editCategory/:id',adminController.loadEditCategory);

//post method to edit category
admin_route.post('/editCategory/:id', uploadImage,
resizeImage,

[
    check('title').trim().notEmpty().withMessage(" category Name is required")
],
async (req,res,next)=>{

   var errors=validationResult(req);
   const data = matchedData(req);
  // console.log(errors);
   if (errors.isEmpty()) {
    return next();
   }
   if(!errors.isEmpty()){
       try{
        const categories=await Category.find({_id:req.params.id});
           return res.render('editCategory',{categories,errors:errors.mapped(),data:data});
       }catch(error){
           console.log(error);
       }
   }
},



adminController.updateEditCategory);

admin_route.get('/deleteCategory/:id',adminController.deleteCategory);
admin_route.get('/listCategory/:id',adminController.listCategory);

// load add product 
admin_route.get('/product',adminController.loadProduct);
//admin_route.post('/product',upload.single('image'),adminController.addProduct);
//admin_route.post('/product',upload.array('image', 4),

admin_route.post('/product',uploadImages,resizeImages,
[
    check('title').trim().notEmpty().withMessage(" Product Name is required"),
    check('description').trim().notEmpty().withMessage(" Description is required"),
    check('unit_price').trim().notEmpty().isFloat({min:1}).withMessage(" Unit price is required"),
    check('quantity').trim().notEmpty().isFloat({min:1}).withMessage(" Quantity  is required"),
    check('weight').trim().notEmpty().withMessage(" Weight is required")
    ],
    async (req,res,next)=>{
        var errors=validationResult(req);
        const data = matchedData(req);
       // console.log(errors);
        if (errors.isEmpty()) {
         return next();
        }
        if(!errors.isEmpty()){
            try{
                 const categories= await Category.find({});
                if(categories){
                return res.render('product',{categories,errors:errors.mapped(),data:data});
               
                }
            }catch(error){
                console.log(error);
            }
        }
    },
    adminController.addProduct);

    
//load product list
admin_route.get('/productList',adminController.loadProductList);
//load editprodct
admin_route.get('/editProduct/:_id',adminController.loadEditProduct);

admin_route.post('/editProduct/:id',uploadImages,resizeImages, 
[
    check('title').trim().notEmpty().withMessage(" Product Name is required"),
    check('description').trim().notEmpty().withMessage(" Description is required"),
    check('unit_price').trim().notEmpty().isFloat({min:1}).withMessage(" Unit price is required"),
    check('quantity').trim().notEmpty().isFloat({min:1}).withMessage(" Quantity  is required"),
    check('weight').trim().notEmpty().withMessage(" Weight is required")
    ],
    async (req,res,next)=>{
        var errors=validationResult(req); 
        const data = matchedData(req);
      //  console.log(errors);
        if (errors.isEmpty()) {
         return next();
        }
        if(!errors.isEmpty()){
            try{
               // console.log(req.session.product);
                const categories= await Category.find({});
                if(categories){
                  return res.render('editProduct',{products:req.session.product,categories,errors:errors.mapped(),data:data});
                }
            }catch(error){
                console.log(error);
            }
        }
    },
   adminController.updateEditProduct);
   //edit product image
 //admin_route.post('/editProductImage/:id', uploadImages,resizeImages,adminController.editProductImage);

// delete product
admin_route.get('/deleteProduct/:id',adminController.deleteProduct);
//load product list
admin_route.get('/listProduct/:id',adminController.listProduct);
//load coupon
admin_route.get('/coupon',adminController.loadCoupon);
//load sales report
admin_route.get('/salesReport',adminController.loadSalesReport);
//post sales report
admin_route.post('/salesReport',adminController.totalSales);
admin_route.get('/totalSales',adminController.totalSales);
// admin_route.get('/exportToExcel',adminController.exportToExcel);

admin_route.get('/Aboutus',adminController.loadAboutus);



module.exports=admin_route 