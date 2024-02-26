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

	try{
		   const OTP = otpGenerator.generate(4, {
			digits: true,
			upperCaseAlphabets: false,
			specialChars: false,
			lowerCaseAlphabets: false,
		});

		return OTP;

	}catch(error){
	return res.status(500).send(error.message);	
	}

};

//encrypt password
const securePassword = async (password) => {
		try {

			const passwordHash = await bcrypt.hash(password, 10);
			return passwordHash;

		} catch (error) {
			return res.status(500).send(error.message);
		}
};


//method to send  OTP by mail
const sendOTPByMail = async (email, otp, req, res) => {

  try{
	
				let testAccount = await nodemailer.createTestAccount();

				// var testemail = "organiccart24@gmail.com"; //change to email
			

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
					to: email,
					subject: "OTP from wwww.organiccart.co.in",
					text: `Your OTP is:${otp}`,
				};

				let data = await transporter.sendMail(mailOptions, (error, info) => {

					if (error) {
						console.log(console.error.message);
					} else {
						console.log("Email sent successfully.");
					}
				});

			} catch (error) {
				return res.status(500).send(error.message);
			}
};


// load registration form
const loadRegister = async (req, res) => {

	try {

		req.session.regerrors = null;
		res.render("registration", { errors: "", data: "" });

	} catch (error) {
		return res.status(500).send(error.message);
	}
};


// load veryfyOtp
const loadverifyOtp = async (req, res) => {

  try {

    res.render("verifyOtp");

  } catch (error) {

    return res.status(500).send(error.message);

  }
};

//========= save  user details ================
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

                await userOTP.save();

               //sending otp by mail
               sendOTPByMail(req.body.email, otp, req, res);

              return  res.json({success:true})

            } else {

                return  res.json({success:false})
             }
                          
            } catch (error) {

                if (error.name === "MongoServerError" && error.code === 11000) {
                return res.json({success:false,
                    message:'Email must be unique'})
                }
            }

};


// verification of otp from user
const verifyOtpFromUserMail = async (req, res) => {

            const user_id = req.session.OTPuser_id;
            const otpinp1 = req.body.inp1;
            const otpinp2 = req.body.inp2;
            const otpinp3 = req.body.inp3;
            const otpinp4 = req.body.inp4;
            var otp = otpinp1 + otpinp2 + otpinp3 + otpinp4;

            console.log(user_id + otp);

        try{

                if (!user_id || !otp) {
                   return  res.render("verifyOtp", { message: "Invalid Otp.Please request again" });
                } 
				else 
				{
                    var userOTPVerificationRecords = await UserOTPVerification.find({
                      user: user_id,
                    });
                }

            if (userOTPVerificationRecords.length <= 0) {

                //no record found
               return res.render("verifyOtp", { message: "OTP has expired.Please request again",  });

            }
			else{

                    //user otp exists
                    const { expiresAt } = userOTPVerificationRecords[0];
                    const dbOtp = userOTPVerificationRecords[0].otp;


                    if (expiresAt < Date.now()) {

                      //user otp record has expired
                      await UserOTPVerification.deleteMany({ user_id });

                      return res.render("verifyOtp", {
                        message: "OTP has expired.Please request again",
                      });

                    }
					else{

                            if (dbOtp != otp) {

                              //supplied otp is wrong
                              return   res.render("verifyOtp", { message: "OTP is incorrect" });

                            } 
							else {

                               //success
                                await User.updateOne({ _id: user_id }, { is_verified: 1 });

                                await UserOTPVerification.deleteMany({ user: user_id });

                                return  res.render("login", { isOtpVerified: true });
                            }
                    }
                 }


                } catch (error) {
                  return res.status(500).send(error.message);
                }
  };


// post resend OTP
const resendOtp = async (req, res) => {

		try {

			user_id = req.session.OTPuser_id;
			email = req.session.email;


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

			//sending otp by mail
			sendOTPByMail(email, otp, req, res);


			res.redirect("/verifyOtp");

		} catch (error) {
			return res.status(500).send(error.message);
		}
};

//user logout
const userLogout = async (req, res) => {

	try {

		delete req.session.user_id;
		delete req.session.cart;
		delete req.session.wishlist;
		delete req.session.bill_Adress;
		delete req.session.total;
		delete req.session.order_Id

		res.redirect("/all_products");

	} catch (error) {
		return res.status(500).send(error.message);
	}
};

// login
const loginLoad = async (req, res) => {

	try{
			res.render("login", { message: "" });

	}catch (error) {
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

					req.session.OTPuser_id = userData._id;

					res.redirect("/verifyOtp");

				
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

					    } 
						else {
					      req.session.wishlist = [];
					    }

					    res.redirect("/all_products");
					} 
					else {

					return res.render("login", { message: "Your access denied" });
					}

				}

			} else {

				return res.render("login", { message: "Email or password incorrect" });
			}

		} else {

			return res.render("login", { message: "User Not Found" });

			}

		} catch (error) {
			return res.status(500).send(error.message);
		}
};


//load home page
const loadHome = async (req, res) => {

		try {

			// res.render('userHome');

		} catch (error) {

			return res.status(500).send("Server error");
		}
};


//load user home
const loadAllProducts = async (req, res) => {

		try {
			const userData = await User.findOne({ _id: req.session.user_id });
			const categories = await Category.find({ unlisted: 0 }).limit(8);
			const products = await Product.find({ unlisted: 0 }).populate("category_id").limit(12);

			// if (products) {
				if(req.session.user_id){

			res.render("index", {

				title: "Fresh Produce",
				categories,
				products: products,
				user: userData,
				cart: req.session.cart,
				wishlist: req.session.wishlist,
			});
			}
			else {
			    res.render('index', {title: "Fresh Produce",products:products,categories})
			}
		} catch (error) {
			return res.status(500).send(error.message);
		}
};

//load my profile
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
			return res.status(500).send(error.message);
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
			return res.status(500).send("Server error");
		}
};

//save edit profile
const editMyProfile = async (req, res) => {
		try {
			const name = req.body.name;
			const phoneno = req.body.phoneno;

			const updatedData = await User.updateOne(

				{ _id: req.session.user_id },
				{ $set: { name: name,  phone: phoneno } }
			);

			if (updatedData) {

			const userData = await User.findOne({ _id: req.session.user_id });
			if (userData) {

		 	 return  res.render("myProfile", {
				user: userData,
				cart: req.session.cart,
				wishlist: req.session.wishlist,message:'Your profile data  has been updated successfully',errors:'',data:''
			  });

			}
			// return res.send("Your profile data  has been updated successfully");
			}
		} catch (error) {
			return res.status(500).send(error.message);
		}
};

// save change password
const saveChangePassword = async (req, res) => {

 		 const id = req.session.user_id;

    try{

     		 const userData=await User.findOne({_id:req.session.user_id});

        if(userData){

              const dbPassword=userData.password;
              const oldPassword=req.body.oldPassword;

              let passMatch=await bcrypt.compare(oldPassword,dbPassword);

                if(passMatch){

              	  const secNewPassword = await securePassword(req.body.password);

                  const data = await User.findOneAndUpdate(
                    { _id: id },
                    { $set: { password: secNewPassword } }
                  );

                	if (data) {

                 	 return res.render("changePassword", { user: userData, errors: "", data: "",
					 message:'Password has been changed successfully' });
                  	} 
				  	else {
                    	return res.send("Failed.Not updated..");
                  	}
                }
                 else{
     
                 return   res.render("changePassword", { user: userData, errors: "", data: "",
				 message:'Old Password is not correct.Try again.' });
                }
    	}
 	 } catch (error) {
    return res.status(500).send("Server error");
  }
};

//forgot password
const loadForgotPassword = async (req, res) => {

		try{

			res.render("forgotPassword");

		}catch (error) {
			return res.status(500).send("Server error");
		}
};


// sending change password  link to  mail and generate  a token
const verifyForgotPassword = async (req, res) => {

		try {

			let email = req.body.email;

			const userData = await User.findOne({ email: email });

			if (userData) {

				if (userData.is_verified === 0) {
					
					return res.send("Invalid operation. Your email is not verified..");
				}
				else {

					const randomstr = randomstring.generate();

					const updatedData = await User.updateOne(

						{ email: email },
						{ $set: { token: randomstr } },
						{ multi: true }
					);

					//send link by mail
					if (updatedData) {

						
						sendResetPasswordLinkByMail(userData.name, email, randomstr);

						return  res.send(
						"Please check your mail,link has been sent to reset password"
						);

					}
					else{
						return res.send("Token not updated");
					}
			    }
			} 	
			else {
			res.render("forgotPassword", {
				user: "",
				errors: "",
				data: "",
				message: "Your email is incorrect.",
			});
			}
		} catch (error) {
			return res.status(500).send("Server error");
		}
};

// send  change  Password Link by mail
const sendResetPasswordLinkByMail = async (name, email, token) => {

		try {
	
			let testAccount = await nodemailer.createTestAccount();

			// var testemail = "organiccart24@gmail.com";
				var testemail=email;

			//connect with smtp
			const transporter = nodemailer.createTransport({

				name: "gmail.com",
				host: "smtp.gmail.com", //'smtp.ethereal.email',
				port: 587,
				secure: false,
				requireTLS: true,

			    auth: {
				
				user: process.env.EMAIL_USER, 
				pass: process.env.EMAIL_PASSWORD,

			   },

			});

			const mailOptions = {

				 from: "organic Cart",
				 to: testemail,//"organiccart24@gmail.com",
				 subject: "For Reset Password",
				 // text:`hi+${token}`
				 html:
					"<p>hi," +
					name +
					// ' Please click here to<a href="http://127.0.0.1:3000/resetPassword?token=' +
					' Please click here to<a href="wwww.organiccart.co.in/resetPassword?token=' +
					token +
					'">Reset Password </a></p> ',
			};

			let data =  transporter.sendMail(mailOptions, (error, info) => {

				if (error) {
					console.log(console.error.message);
				} else {
					console.log("Email sent successfully.");
				}
			});

		} catch (error) {
			return res.status(500).send(error.message);
		}
};

//reset forgot password
const loadResetPassword = async (req, res) => {

		try {
			const token = req.query.token;

			const tokenData = await User.findOne({ token: token });

		if (tokenData) {

			res.render("resetPassword", {

				email: tokenData.email,
				errors: "",
				data: "",
			});
		}
			
		} catch (error) {
			return res.status(500).send(error.message);
		}
};

//save reset password
const saveResetPassword = async (req, res) => {

		try {

			const password = req.body.password;
			const _email = req.body.Email;

			const sec_Password = await securePassword(password);

			const updatedData = await User.updateOne(

				{ email: _email },
				{ $set: { password: sec_Password, token: "" } }

			);
			if (updatedData) {

			return res.send("Your password has been reset successfully");
			
			}
			
		} catch (error) {
			return res.status(500).send(error.message);
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
    }catch (error) {
    return res.status(500).send(error.message);
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
			return res.status(500).send(error.message);
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
			return res.status(500).send(error.message);
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

			  return res.send(
				"Link has been sent to the given mail id");

			} 
			else {

			return res.send("Code not updated");

			}


		} catch (error) {
			if (error.name === 'MongoServerError' && error.code === 11000) {
			return res.send('email already exists');
			}
			return res.status(500).send("Server error");
		}
};

//method to send  Referral Link by mail
const sendReferralLinkByMail = async ( email, code) => {
	
		try {
		
			var testemail = "organiccart24@gmail.com";

			//connect with smtp
			const transporter = nodemailer.createTransport({

				name: "gmail.com",
				host: "smtp.gmail.com", //'smtp.ethereal.email',
				port: 587,
				secure: false,
				requireTLS: true,

				auth: {
					
					user: process.env.EMAIL_USER, 
					pass: process.env.EMAIL_PASSWORD,
				},

			});

			const mailOptions = {

					from: "organic Cart",
					to: email,//"organiccart24@gmail.com", //email,
					subject: "For Referral Link from Organic Cart",
					// text:`hi+${token}`
					html:
					"<p>hi," +
				
					// ' Please click here to <a href="http://127.0.0.1:3000/register?code=' +
					 ' Please click here to <a href="wwww.organiccart.co.in/register?code=' +
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
			return res.status(500).send(error.message);
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
