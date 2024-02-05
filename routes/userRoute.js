const express=require('express');
const user_route=express();

const session=require('express-session');
const config=require("../config/config");

const User = require('../models/userModel');

user_route.use(session({secret:config.sessionSecret,resave:false, saveUninitialized: true}));


const userController=require('../controllers/userController');
const productController=require('../controllers/productController');
//express validator
const {check , validationResult,matchedData} = require('express-validator');

const auth=require("../middleware/auth")

user_route.set('view engine','ejs');
user_route.set('views','./views/user');

const bodyparser=require('body-parser');
user_route.use(bodyparser.urlencoded({extended:false}));
user_route.use(bodyparser.json());

const multer=require('multer');
const path=require('path');

// checking for file type
// const MIME_TYPES = {
//     'imgs/jpg': 'jpg',
//     'imgs/jpeg': 'jpeg',
//     'imgs/png': 'png'
// }
// const storage=multer.diskStorage({

//         destination:function(req,file,cb){
//             cb(null,path.join(__dirname,'../public/images/user'));
// },
//       filename:function(req,file,cb){
//                 const name=Date.now()+'_'+file.originalname;
//           cb(null,name);
// }
// }); 
// const upload=multer({storage:storage});

//auth.isLogout
user_route.get('/register',userController.loadRegister);

user_route.post('/register',
 [
  check('name').trim().notEmpty().withMessage("Name is required")
  .isLength({min:2}).withMessage("Name must be at least 2 characters"),
  check('email').trim().isEmail().withMessage("Invalid Email")
  .custom(async value => {
    const existingUser = await User.findOne({email:value});
    if (existingUser) {
      // Will use the below as the error message
      throw new Error('A user already exists with this e-mail address');
    }}),
  check('phone').trim().isLength({min:10}).withMessage("Phone no must be 10 digits"),
  check('password').trim().escape().notEmpty().withMessage("password  is required")
  .isLength({min:5,max:16}).withMessage("Password must be between 5 to 16 characters")
  .matches('[0-9]').withMessage('Password Must Contain a Number')
  //.matches('(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}').withMessage('Password is not valid')
  .matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter'),
  check('confirmPassword').trim().escape().notEmpty().withMessage("password  is required")
  .isLength({min:5}).withMessage("Password must be between 5 to 16 characters")
  //validate confirm password
  .custom(async(confirmPassword,{req})=>{
    const password=req.body.password;
    if(password!=confirmPassword){
      throw new Error("passwords must be same")
    }
  })
    ],(req,res,next)=>{
     var errors=validationResult(req);
     const data = matchedData(req);
     console.log(errors);
     req.session.regerrors=errors;
     if (errors.isEmpty()) {
      return next();
     }
     if(!errors.isEmpty()){
      return res.render('registration',{errors:errors.mapped(),data:data});
     }
},
 userController.insertUser);
//load verify otp page
user_route.get('/verifyOtp',userController.loadverifyOtp);
//verify otp from user mail
user_route.post('/verifyOtp',userController.verifyOtpFromUserMail);
//resend otp
user_route.get('/resendOtp',userController.resendOtp);
// user_route.post('/resendOtp',userController.verifyOtpFromUserMail);

user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.verifyLogin);
user_route.get('/logout',userController.userLogout);

// //load my account
// user_route.get('/myAccount',userController.loadMyAccount);

//load my account
user_route.get('/myProfile',userController.loadMyProfile);

//edit profile
user_route.post('/myProfile',userController.editMyProfile);

//load change password
user_route.get('/changePassword',auth.isLogin,userController.loadchangePassword); 

//post  change password
user_route.post('/changePassword',auth.isLogin,[
 check('password').trim().escape().notEmpty().withMessage("password  is required")
.isLength({min:5,max:16}).withMessage("Password must be between 5 to 16 characters")
.matches('[0-9]').withMessage('Password Must Contain a Number')
//.matches('(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}').withMessage('Password is not valid')
.matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter'),
check('cPassword').trim().escape().notEmpty().withMessage("password  is required")
.isLength({min:5}).withMessage("Password must be between 5 to 16 characters")
//validate confirm password
.custom(async(cPassword,{req})=>{
  const password=req.body.password;
  if(password!=cPassword){
    throw new Error("passwords must be same")
  }
})
  ],(req,res,next)=>{
   var errors=validationResult(req);
   const data = matchedData(req);
   console.log(errors);
   //req.session.regerrors=errors;
   if (errors.isEmpty()) {
    return next();
   }
   if(!errors.isEmpty()){
    return res.render('changePassword',{user:'',errors:errors.mapped(),data:data});
   }
},userController.saveChangePassword);


user_route.get('/userHome',auth.isLogin,userController.loadHome);

// include auth.isLogin user home products
user_route.get('/all_products',auth.isLogin,userController.loadAllProducts);

// check user not logged in, load forgot password form
user_route.get('/forgotPassword',auth.isLogout,userController.loadForgotPassword);

//post forgot password with email
user_route.post('/forgotPassword',userController.verifyForgotPassword);

//load reset password
user_route.get('/resetPassword',auth.isLogout,userController.loadResetPassword);

//post reset password
user_route.post('/resetPassword',auth.isLogout,
[
  check('password').trim().escape().notEmpty().withMessage("password  is required")
 .isLength({min:5,max:16}).withMessage("Password must be between 5 to 16 characters")
 .matches('[0-9]').withMessage('Password Must Contain a Number')
 //.matches('(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{5,}').withMessage('Password is not valid')
 .matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter'),
 check('cPassword').trim().escape().notEmpty().withMessage("password  is required")
 .isLength({min:5}).withMessage("Password must be between 5 to 16 characters")
 //validate confirm password
 .custom(async(cPassword,{req})=>{
   const password=req.body.password;
   if(password!=cPassword){
     throw new Error("passwords must be same")
   }
 })
   ],(req,res,next)=>{
    var errors=validationResult(req);
    const data = matchedData(req);
    console.log(errors);
    //req.session.regerrors=errors;
    if (errors.isEmpty()) {
     return next();
    }
    if(!errors.isEmpty()){
     return res.render('resetPassword',{errors:errors.mapped(),data:data});
    }
 }
,userController.saveResetPassword);

// load wallet history
user_route.get('/walletHistory',auth.isLogin,userController.loadWalletHistory);

//load user coupon list
user_route.get('/userCoupon',auth.isLogin,userController.loadUserCouponList);

//load send referral link
user_route.get('/getReferralLink',auth.isLogin,userController.loadSendReferralLink);

//load send referral link
user_route.post('/sendReferralLink',auth.isLogin,userController.sendReferralLink);

//load user product list
user_route.post('/all_products',productController.getAllProducts);

module.exports=user_route