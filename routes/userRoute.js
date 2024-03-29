const express=require('express');
const user_route=express();

const session=require('express-session');
const config=require("../config/config");

//user Model
const User = require('../models/userModel');

//controller
const userController=require('../controllers/userController');
const productController=require('../controllers/productController');

//session
user_route.use(session({secret:config.sessionSecret,resave:false, saveUninitialized: true}));

//express validator
const {check , validationResult,matchedData} = require('express-validator');


//middleware
const auth=require("../middleware/auth");
const validation=require("../middleware/validation");

//view engine
user_route.set('view engine','ejs');
user_route.set('views','./views/user');

//body parser
const bodyparser=require('body-parser');
user_route.use(bodyparser.urlencoded({extended:false}));
user_route.use(bodyparser.json());

//load  main page
user_route.get('/',userController.loadAllProducts);

//auth.isLogout
user_route.get('/register',auth.isLogout,userController.loadRegister);

user_route.post('/register',auth.isLogout,
      [
        check('name').trim().notEmpty().withMessage("Name is required")
       .isLength({min:2}).withMessage("Name must be at least 2 characters"),
        check('email').trim().isEmail().withMessage("Invalid Email")
       .custom(async value => {
         const existingUser = await User.findOne({email:value});
            if (existingUser) {
               // throw new Error('A user already exists with this e-mail address');
              return res.json({success:false,
              message:'Email must be unique'})
            }
         }),

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
            // console.log(errors);
            req.session.regerrors=errors;
            if (errors.isEmpty()) {
              return next();
            }
            if(!errors.isEmpty()){
              return res.render('registration',{errors:errors.mapped(),data:data});
            }
}, userController.insertUser);


//load verify otp page
user_route.get('/verifyOtp',auth.isLogout,userController.loadverifyOtp);

//verify otp from user mail
user_route.post('/verifyOtp',userController.verifyOtpFromUserMail);

//resend otp
user_route.get('/resendOtp',userController.resendOtp);

user_route.get('/login',auth.isLogout,userController.loginLoad);

user_route.post('/login',userController.verifyLogin);

user_route.get('/logout',auth.isLogin,userController.userLogout);

//load my account
user_route.get('/myProfile',auth.isLogin,userController.loadMyProfile);

//edit profile
user_route.post('/myProfile',[

          ],
          async(req,res,next)=>{
            var errors=validationResult(req);
            const data = matchedData(req);
          // console.log(errors);
            req.session.regerrors=errors;
            if(!errors.isEmpty()){
              const userData = await User.findOne({ _id: req.session.user_id });
              if (userData) {
            res.render("myProfile", {
                  user: userData,
                  cart: req.session.cart,
                  wishlist: req.session.wishlist,errors:errors.mapped(),data:data
                });
              }
                //   //  return res.render('myProfile',{errors:errors.mapped(),data:data});
                  }
                  if (errors.isEmpty()) {
                  return next();
                  }           
},userController.editMyProfile);

//load change password
user_route.get('/changePassword',auth.isLogin,userController.loadchangePassword); 

//post  change password
user_route.post('/changePassword',
[
    check('oldPassword').trim().escape().notEmpty().withMessage(" Old Password  is required"),
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
        if (errors.isEmpty()) {
          return next();
        }
        if(!errors.isEmpty()){
          return res.render('changePassword',{user:'',errors:errors.mapped(),data:data});
        }
},userController.saveChangePassword);

// user_route.get('/userHome',auth.isLogin,userController.loadHome);

//user home products index page
user_route.get('/all_products',userController.loadAllProducts);

//load home index page
user_route.get('/index',userController.loadAllProducts);

//load home index page
user_route.get('/home',userController.loadAllProducts);

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
          if (errors.isEmpty()) {
            return next();
            }
            if(!errors.isEmpty()){
            return res.render('resetPassword',{errors:errors.mapped(),data:data});
            }
 },userController.saveResetPassword);

// load wallet history
user_route.get('/walletHistory',auth.isLogin,userController.loadWalletHistory);

//load user coupon list
user_route.get('/userCoupon',auth.isLogin,userController.loadUserCouponList);

//load send referral link
user_route.get('/getReferralLink',auth.isLogin,userController.loadSendReferralLink);

//load send referral link
user_route.post('/sendReferralLink',auth.isLogin,userController.sendReferralLink);

//load user product list
user_route.post('/all_products',auth.isLogin,productController.getAllProducts);

module.exports=user_route