const User = require("../models/userModel");
const UserOTPVerification = require("../models/userOTPVerification");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const coupon = require('../models/couponModel');
const Referral=require('../models/referralModel')

const randomstring = require("randomstring");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const dotenv = require("dotenv");
const { resolveContent } = require("nodemailer/lib/shared");
dotenv.config();



//generate OTP
const generateOTP = () => {
  const OTP = otpGenerator.generate(4, {
    digits: true,
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  return OTP;
};
const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
    return res.status(500).send(error.message);
  }
};

//decrypt password


//method to send  OTP by mail
const sendOTPByMail = async (email, otp, req, res) => {
  try {
    //for temp smtp account by Ethereal.com
    let testAccount = await nodemailer.createTestAccount();
    var testemail = "organiccart24@gmail.com";
    //connect with smtp
    const transporter = nodemailer.createTransport({
      name: "gmail.com", //only for gmail
      host: "smtp.gmail.com", //'smtp.ethereal.email',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        // TODO: replace `user` and `pakennedi82@ethereal.emailss` values from <https://forwardemail.net>
        user: process.env.EMAIL_USER, //temp id from ethereal.com
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: "organic Cart",
      to: testemail,
      subject: "OTP from OrganicCart.com",
      text: `Your OTP is:${otp}`,
    };
    console.log(process.env.EMAIL_USER);
    let data = await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(console.error.message);
      } else {
        console.log("Email sent successfully.");
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server Error");
  }
};
//method to load registration form
const loadRegister = async (req, res) => {
  try {
    req.session.regerrors = null;
    res.render("registration", { errors: "", data: "" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server error");
  }
};


//================method to load /veryfyOtp======================

const loadverifyOtp = async (req, res) => {

  try {

    res.render("verifyOtp");

  } catch (error) {

    console.log(error.message);
    return res.status(500).send("Server error");

  }
};



//========= register  user================

const insertUser = async (req, res) => {

    try {
   
     
         const secPassword = await securePassword(req.body.password);
        
          const user = User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            // image: req.file.filename,
            password: secPassword,
          });

        const userData = await user.save();

        if(userData) {

              var id = userData._id;
              req.session.OTPuser_id = userData._id;
              req.session.email = userData.email;

            //  console.log(req.session.OTPuser_id + req.session.email);

                //generate otp
                const otp = generateOTP();
                console.log(otp);


              //save otp in db
              const userOTP =  new UserOTPVerification({

                user: userData._id,
                otp: otp,
                createdAt: Date.now(),
                expiresAt: Date.now() + 3600000,

              });

                //save otp record
                await userOTP.save();
                // console.log("otp saved");

               //sending otp by mail
               sendOTPByMail(req.body.email, otp, req, res);


                // res.redirect("/verifyOtp");
              return  res.json({success:true})


            } else {

                    // res.render("registration", {
                    //   message: "Your registration has been failed",
                    // });
                    return  res.json({success:false})
                 }
                          
            } catch (error) {

                if (error.name === "MongoServerError" && error.code === 11000) {
                  // res.send("Email must be unique");
                return res.json({success:false,
                    message:'Email must be unique'})
                }
              console.log(error.message);
            }

};


//========================   verification of otp from user  =================

const verifyOtpFromUserMail = async (req, res) => {

            const user_id = req.session.OTPuser_id;
            const otpinp1 = req.body.inp1;
            const otpinp2 = req.body.inp2;
            const otpinp3 = req.body.inp3;
            const otpinp4 = req.body.inp4;
            var otp = otpinp1 + otpinp2 + otpinp3 + otpinp4;

            console.log(user_id + otp);

          try {

                  if (!user_id || !otp) {
                    res.render("verifyOtp", { message: "Invalid Otp.Please request again" });
                    //  throw Error("Empty otp details are not allowed");
                  } else {
                    var userOTPVerificationRecords = await UserOTPVerification.find({
                      user: user_id,
                    });
                    // console.log(userOTPVerificationRecords.length)
                  }

              if (userOTPVerificationRecords.length <= 0) {

                //no record found
                // throw new Error("Account doesnot exist or has been verified already.Please Sign up or login.")
                res.render("verifyOtp", { message: "OTP has expired.Please request again",  });

              } else {

                    //user otp exists
                    const { expiresAt } = userOTPVerificationRecords[0];
                    const dbOtp = userOTPVerificationRecords[0].otp;


                    if (expiresAt < Date.now()) {
                      //user otp record has expired
                      await UserOTPVerification.deleteMany({ user_id });
                      // throw new Error("Code has expired.Please request again.")
                      res.render("verifyOtp", {
                        message: "OTP has expired.Please request again",
                      });

                     } else {

                            if (dbOtp != otp) {
                              //supplied otp is wrong
                              //throw new Error("Invalid code.Check ur mail..")
                              res.render("verifyOtp", { message: "OTP is incorrect" });
                            } else {
                              //success
                              await User.updateOne({ _id: user_id }, { is_verified: 1 });
                              await UserOTPVerification.deleteMany({ user: user_id });
                              res.render("login", { isOtpVerified: true });
                            }
                      }
                 }


                } catch (error) {
                  // res.json({
                  //     status: "FAILED",
                  //     message: error.message
                  // })
                  console.log(error);
                  return res.status(500).send("Server error");
                }
  };


//===================method to post resend OTP=================

const resendOtp = async (req, res) => {

  try {
    user_id = req.session.OTPuser_id;
    email = req.session.email;
    // console.log(user_id+user_id);
    await UserOTPVerification.deleteMany({ user: user_id });
    const otp = generateOTP();
    console.log(otp);
    //save otp in db
    const userOTP = await new UserOTPVerification({
      user: user_id,
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });
    //save otp record
    await userOTP.save();
    // console.log("otp saved");
    //sending otp by mail
    sendOTPByMail(email, otp, req, res);
    //  res.render('verifyOtp',{message:'Otp resent.Please check your mail.'})
    res.redirect("/verifyOtp");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
const userLogout = async (req, res) => {
  try {
    // req.session.destroy();
    delete req.session.user_id;
    delete req.session.cart;
    delete req.session.wishlist;
    delete req.session.bill_Adress;
    delete req.session.total;
    delete req.session.order_Id

    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};
//method for login
const loginLoad = async (req, res) => {
  try {
    res.render("login", { message: "" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
//veifylogin
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const passMatch = await bcrypt.compare(password, userData.password);
      if (passMatch) {
        if (userData.is_verified === 0) {
          // console.log("not verified");
          req.session.OTPuser_id = userData._id;
          res.redirect("/verifyOtp");
          //  res.render('verifyOtp',{message:'Please verify your OTP sent via mail or resend Otp.'})
          // Please verify your OTP sent via mail
        } else {
          if (userData.is_blocked === 0) {
            req.session.user_id = userData._id;
            req.session.username = userData.name;

            if (userData.cart_Data !== "undefined") {
              req.session.cart = userData.cart_Data;
            } else {
              req.session.cart = [];
            }

            if (userData.wishlist_Data !== "undefined") {
              req.session.wishlist = userData.wishlist_Data;
            } else {
              req.session.wishlist = [];
            }

            res.redirect("/all_products");
          } else {
            res.render("login", { message: "Your access denied" });
          }
          // res.render('all_products',{user:userData})
        }
      } else {
        res.render("login", { message: "Email or password incorrect" });
      }
    } else {
      res.render("login", { message: "User Not Found" });
    }
  } catch (error) {
    // Error.captureStackTrace(err);
    // console.log(err.stack);
    console.log(error);
    return res.status(500).send("Server error");
  }
};
//load home page
const loadHome = async (req, res) => {
  try {
    // res.render('userHome');
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

//load all products
const loadAllProducts = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    const categories = await Category.find({ unlisted: 0 }).limit(8);
    const products = await Product.find({ unlisted: 0 }).populate("category_id").limit(12);
    // console.log(products);
    // console.log(products[0].category_id.offer_Percentage);
    if (products) {
      res.render("all_products", {
        title: "Fresh Produce",
        categories,
        products: products,
        user: userData,
        cart: req.session.cart,
        wishlist: req.session.wishlist,
      });
    }
    // else {
    //     res.render('all_products', {title:'No Products',products:'',user:userData,cart:req.session.cart })
    // }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
//load my account
const loadMyProfile = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    if (userData) {
      res.render("myProfile", {
        user: userData,
        cart: req.session.cart,
        wishlist: req.session.wishlist,errors:'',data:'',message:''
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
//load change password
const loadchangePassword = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    if (userData) {
      res.render("changePassword", { user: userData, errors: "", data: "" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

//save edit profile
const editMyProfile = async (req, res) => {
  try {
    const name = req.body.name;
   // const email = req.body.email;
    const phoneno = req.body.phoneno;

    const updatedData = await User.updateOne(
      { _id: req.session.user_id },
      { $set: { name: name,  phone: phoneno } }
    );
    if (updatedData) {
      const userData = await User.findOne({ _id: req.session.user_id });
    if (userData) {
     res.render("myProfile", {
        user: userData,
        cart: req.session.cart,
        wishlist: req.session.wishlist,message:'Your profile data  has been updated successfully',errors:'',data:''
      });
    }
     // return res.send("Your profile data  has been updated successfully");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

// save change password
const saveChangePassword = async (req, res) => {
  const id = req.session.user_id;
  try {

      const userData=await User.findOne({_id:req.session.user_id});
      if(userData){
              const dbPassword=userData.password;
              const oldPassword=req.body.oldPassword;
              let passMatch=await bcrypt.compare(oldPassword,dbPassword);
              console.log(passMatch);
              if(passMatch){
               const secNewPassword = await securePassword(req.body.password);
                  const data = await User.findOneAndUpdate(
                    { _id: id },
                    { $set: { password: secNewPassword } }
                  );

                  if (data) {
                   res.render("changePassword", { user: userData, errors: "", data: "",message:'Password has been changed successfully' });
                  } else {
                    res.send("Failed.Not updated..");
                  }
            }
            else{
     
                  res.render("changePassword", { user: userData, errors: "", data: "",message:'Old Password is not correct.Try again.' });
                }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

//forgot password
const loadForgotPassword = async (req, res) => {
  try {
    res.render("forgotPassword");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
// sending reset link to  mail and generate  a token
const verifyForgotPassword = async (req, res) => {
  try {
    let email = req.body.email;

    const userData = await User.findOne({ email: email });
    if (userData) {
      if (userData.is_verified === 0) {
        //res.render('forgotPassword',{user:'',errors:'',data:'',message:'Invalid operation. Your mail is not verified..'});
        res.send("Invalid operation. Your email is not verified..");
      } else {
        const randomstr = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomstr } },
          { multi: true }
        );

        //send link by mail
        if (updatedData) {
          sendResetPasswordLinkByMail(userData.name, userData.email, randomstr);

          // res.render('forgotPassword',{user:'',errors:'',data:'',message:'Please check your mail to reset password'});
          res.send(
            "Please check your mail,link has been sent to reset password"
          );
        } else {
          res.send("Token not updated");
        }
      }
    } else {
      res.render("forgotPassword", {
        user: "",
        errors: "",
        data: "",
        message: "Your email is incorrect.",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
//method to send  Reset Password Link by mail
const sendResetPasswordLinkByMail = async (name, email, token) => {
  try {
    //for temp smtp account by Ethereal.com
    let testAccount = await nodemailer.createTestAccount();
    var testemail = "organiccart24@gmail.com";
    //connect with smtp
    const transporter = nodemailer.createTransport({
      name: "gmail.com",
      host: "smtp.gmail.com", //'smtp.ethereal.email',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        // TODO: replace `user` and `pakennedi82@ethereal.emailss` values from <https://forwardemail.net>
        user: process.env.USER_EMAIL, //temp id from ethereal.com
        pass: process.env.USER_PASSWORD,
      },
    });
    const mailOptions = {
      from: "organic Cart",
      to: "organiccart24@gmail.com", //email,
      subject: "For Reset Password",
      // text:`hi+${token}`
      html:
        "<p>hi," +
        name +
        ' Please click here to<a href="http://127.0.0.1:3000/resetPassword?token=' +
        token +
        '">Reset Password </a></p> ',
    };

    let data = await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(console.error.message);
      } else {
        console.log("Email sent successfully.");
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server error");
  }
};
//reset forgot password
const loadResetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    console.log(token);
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      // console.log(tokenData.email);
      res.render("resetPassword", {
        email: tokenData.email,
        errors: "",
        data: "",
      });
    }
    //else{
    //     res.render('404',{message:'Invalid token'});
    //     }

    // res.render('forgotPassword',{user:'',errors:'',data:''});
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
//save reset password
const saveResetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const _email = req.body.Email;
    //var user_id=req.body.user_id;
    const sec_Password = await securePassword(password);
    console.log("email" + _email);
    const updatedData = await User.updateOne(
      { email: _email },
      { $set: { password: sec_Password, token: "" } }
    );
    if (updatedData) {
      return res.send("Your password has been reset successfully");
      //res.render('message', { successMessage: 'Operation successful!' });
    }
    //     var msg="Your password has been reset successfully"

    // }else{
    //   msg="Something went wrong";
    // }
    // res.render('resetPassword',{modalMessage:msg,user:'',cart:''});
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
//load wallet History
const loadWalletHistory = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });

    if (userData) {
      res.render("wallet_History", {
        user: userData,
        cart: req.session.cart,
        wishlist: req.session.wishlist,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

 //coupon List
 const loadUserCouponList=async(req,res)=>{
  try{
    const userData = await User.findOne({ _id: req.session.user_id });
      const coupons=await coupon.find({});
    if(coupons){
      // const itemsperpage = 3;
      //   const currentpage = parseInt(req.query.page) || 1;
      //   const startindex = (currentpage - 1) * itemsperpage;
      //   const endindex = startindex + itemsperpage;
      //   const totalpages = Math.ceil(coupons.length / 3);
      //   let currentCoupon = coupons.slice(startindex,endindex);
          res.render('userCoupon',{ user: userData,
            cart: req.session.cart,
            wishlist: req.session.wishlist,coupons:coupons});

      }
   }catch(error){
    console.log(error)
    return res.status(500).send("Server Error");
  }
}
//load send referral link
const loadSendReferralLink = async (req, res) => {
  try {

    const userData = await User.findOne({ _id: req.session.user_id });
    res.render("referral",{user: userData,
      cart: req.session.cart,
      wishlist: req.session.wishlist});

  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
// sending referral link to  mail and generate  a code
const sendReferralLink = async (req, res) => {
  try {
    let email = req.body.email;

    const randomstr = randomstring.generate();
    const updatedData = await User.updateOne(
      { email: email },
      { $set: { referral_code: randomstr } },
      { multi: true }
    );

    const refer = Referral({
      user_id: req.session.user_id,
      referred_email: req.body.email,
      referral_Code:randomstr,
     });
    const refData = await refer.save();

    if (refData) {
      sendReferralLinkByMail(req.body.email, randomstr);

      // res.render('forgotPassword',{user:'',errors:'',data:'',message:'Please check your mail to reset password'});
      return res.send(
        "Link has been sent to the given mail id");
    } else {
      return res.send("Code not updated");

    }


  } catch (error) {
    if (error.name === 'MongoServerError' && error.code === 11000) {
     return res.send('email already exists');
     }
    console.log(error);
    return res.status(500).send("Server error");
  }
};

//method to send  Reset Password Link by mail
const sendReferralLinkByMail = async ( email, code) => {
  try {
    //for temp smtp account by Ethereal.com
   // let testAccount = await nodemailer.createTestAccount();
    var testemail = "organiccart24@gmail.com";
    //connect with smtp
    const transporter = nodemailer.createTransport({
      name: "gmail.com",
      host: "smtp.gmail.com", //'smtp.ethereal.email',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        // TODO: replace `user` and `pakennedi82@ethereal.emailss` values from <https://forwardemail.net>
        user: process.env.EMAIL_USER, //temp id from ethereal.com
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: "organic Cart",
      to: testemail,//"organiccart24@gmail.com", //email,
      subject: "For Referral Link from Organic Cart",
      // text:`hi+${token}`
      html:
        "<p>hi," +
       
        ' Please click here to <a href="http://127.0.0.1:3000/register?code=' +
        code +
        '"> Sign Up Now</a></p> ',
    };

    let data = await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(console.error.message);
      } else {
        console.log("Email sent successfully.");
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server error");
  }
};
//Exports
module.exports = {
  loadRegister,
  insertUser,
  loadverifyOtp,
  verifyOtpFromUserMail,
  resendOtp,
  loginLoad,
  verifyLogin,
  userLogout,
  loadMyProfile,
  editMyProfile,
  loadHome,

  loadAllProducts,

  //change password
  loadchangePassword,
  saveChangePassword,
  
  loadForgotPassword,
  verifyForgotPassword,
  loadResetPassword,
  saveResetPassword,

  //referral
  loadSendReferralLink,
  sendReferralLink,


  loadWalletHistory,
  loadUserCouponList
};
