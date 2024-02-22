//express validator
const {check , validationResult,matchedData} = require('express-validator');


//address validation  rules
const addressValidationRules=()=>{
  return [
     check('FullName').trim().notEmpty().withMessage("FullName is required")
     .isLength({min:2}).withMessage("FullName must be at least 2 characters"),
     check('HouseName').trim().notEmpty().withMessage("HouseName is required")
      .isLength({min:2}).withMessage("HouseName must be at least 2 characters"),
      check('StreetName').trim().notEmpty().withMessage("StreetName is required")
      .isLength({min:5}).withMessage("StreetName must be at least 2 characters"),
      check('City').trim().notEmpty().withMessage("City is required")
      .isLength({min:2}).withMessage("City must be at least 2 characters"),
      check('State').trim().notEmpty().withMessage("State is required")
      .isLength({min:3}).withMessage("State must be at least 2 characters"),
      check('Pincode').trim().notEmpty().withMessage("Pincode is required")
      .isLength({min:6}).withMessage("Pincode must be at least 6 characters"),
      check('ContactNumber').trim().notEmpty().withMessage("ContactNumber is required")
      .isLength({min:10}).withMessage("ContactNumber must be at least 10 characters")
 
      
    ]
};

//edit address handle validation
 const HandleEditAddressValidationErrors= (req,res,next)=>{

        var errors=validationResult(req);
        const data = matchedData(req);
        //console.log(errors);
       // req.session.addresserrors=errors;
        // if (errors.isEmpty()) {
        //  return next();
        // } 
        // if(!errors.isEmpty()){
        // //  return res.render('editAddress/:id',{errors:errors.mapped(),data:data});
        return ({errors:errors.mapped(),data:data})
        //}
      }





const validateCategory=async(req,res,next)=>{
    [
        check('title').trim().notEmpty().withMessage(" category Name is required")
        ],
        (req,res,next)=>{
           var errors=validationResult(req);
           const data = matchedData(req);
           console.log(errors);
           if (errors.isEmpty()) {
            return next();
           }
           if(!errors.isEmpty()){
               try{
                   return res.render('editCategory',{errors:errors.mapped(),data:data});
               }catch(error){
                   console.log(error);
               }
           }
        }
        
}

//coupon validation
const couponValidationRules=()=>{
  return [
     check('code').trim().notEmpty().withMessage("Code is required")
     .isLength({min:2}).withMessage("Code must be at least 2 characters"),
     check('description').trim().notEmpty().withMessage("Description is required")
      .isLength({min:2}).withMessage("Description must be at least 2 characters"),
      check('offerPrice').trim().notEmpty().isFloat({min:1}).withMessage("offerPrice is required"),
      check('minimumAmount').trim().notEmpty().isFloat({min:1}).withMessage("MinimumAmount is required"),
      check('expiryDate').trim().notEmpty().withMessage("expiryDate is required")    
    ]
};

//edit profile validation rules

//coupon validation
const editProfileValidationRules=()=>{
  return [
    check('name').trim().notEmpty().withMessage("Name is required")
  .isLength({min:2}).withMessage("Name must be at least 2 characters"),
  check('email').trim().isEmail().withMessage("Invalid Email")
  .custom(async value => {
    const existingUser = await User.findOne({email:value});
    if (existingUser) {
      // Will use the below as the error message
      throw new Error('A user already exists with this e-mail address');
    }}),
  check('phone').trim().isLength({min:10}).withMessage("Phone no must be 10 digits")
  ]
};
module.exports={
   validateCategory,
  addressValidationRules,
  couponValidationRules,
  HandleEditAddressValidationErrors,
  editProfileValidationRules
}