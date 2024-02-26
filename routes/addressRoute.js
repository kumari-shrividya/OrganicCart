const express=require('express');
const address_route=express();

//express validator
const {check , validationResult,matchedData} = require('express-validator');

//session
const session=require('express-session');
const config=require("../config/config");
address_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}))

//addressController 
const addressController=require('../controllers/addressController');

//middleware
const auth=require("../middleware/auth")
const validation=require("../middleware/validation")


//view engine
address_route.set('view engine','ejs');
address_route.set('views','./views/address');

//body parser
const bodyparser=require('body-parser');
address_route.use(bodyparser.json());
address_route.use(bodyparser.urlencoded({extended:true}));

//load add address
address_route.get('/addAddress',auth.isLogin,
addressController.loadAdd_Address);

//post - save Address with validation check
// address_route.post('/addAddress',validation.addressValidationRules(),(req,res,next)=>{
//     var errors=validationResult(req);
//     const data = matchedData(req);
//     //console.log(errors);
//    // req.session.addresserrors=errors;
//     if (errors.isEmpty()) {return next(); } 
//     if(!errors.isEmpty()){return res.render('addAddress',{errors:errors.mapped(),data:data});}}
// ,addressController.add_Address);

 address_route.post('/addAddress',auth.isLogin,addressController.add_Address);

  //load address list
  address_route.get('/addressList',auth.isLogin,addressController.loadAddressList);
  //set as default address
  address_route.get('/set_As_Default/:id',auth.isLogin,addressController.set_As_Default);

  //load edit  address page
  address_route.get('/editAddress/:id',auth.isLogin, addressController.loadEditAddress);

  //post edit  address page
  address_route.post('/editAddress/:id',auth.isLogin,validation.addressValidationRules(),
     (req,res,next)=>{
        try{
           var errors=validationResult(req);
           const data = matchedData(req);
          if (errors.isEmpty()) {
            return next();
          } 
          if(!errors.isEmpty()){
            return res.render('editAddress',{user:req.session.editAddressUser,
              address:req.session.editAddressUser.address,
            errors:errors.mapped(),data:data});
          }
      }catch(error){
       return res.status(500).send("Server Error");
      }
  },addressController.updateEditAddress);

  //delete address
  address_route.get('/deleteAddress/:id',auth.isLogin,addressController.deleteAddress);
 //get checkout addess
  address_route.get('/getCheckoutAddress/:id',auth.isLogin,addressController.getCheckoutAddress);

//Exports
 module.exports=address_route