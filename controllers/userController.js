const User = require('../models/userModel');
const UserOTPVerification=require('../models/userOTPVerification')

const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const otpGenerator = require('otp-generator');

const dotenv=require('dotenv');
dotenv.config();

//generate OTP
const generateOTP=()=>{
    const OTP=otpGenerator.generate(6, {digits:true, 
        upperCaseAlphabets: false, 
        specialChars: false,
        lowerCaseAlphabets:false });
     

  return OTP;
};

const securePassword=async(password)=>{

    try{

        const passwordHash=await bcrypt.hash(password,10)
            return passwordHash;
    }catch(error){
        console.log(error.message)
    }
}

// const storeOTPInDb=async(user_id,otp){

// }

//method to send  OTP by mail

const sendOTPByMail=async (email,otp)=>{

    try{

        //for fake smtp account by Ethereal.com
        let testAccount=await nodemailer.createTestAccount();

        //connect with smtp
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            requireTLS:true,
            auth: {
              // TODO: replace `user` and `pass` values from <https://forwardemail.net>
              user: 'lane.paucek59@ethereal.email', //fake id from ethereal.com
              pass: 'Merwpqmz95ZaY2fWBR',
            }
          });


          //calling fn
        //   console.log(process.env.SMTP_HOST+" "+process.env.SMTP_PORT);
        //   console.log(process.env.SMTP_MAIL+" "+process.env.SMTP_PASSWORD);
          //console.log(email)

        //   const otp=generateOTP();
        //   console.log(otp);

         const  mailOptions={
            from:'lane.paucek59@ethereal.email',
            to:email,
            subject:'OTP from OrganicCart.com',
            text:`Your OTP is:${otp}`
          }
         
      let data=await  transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(console.error.message);
            }
            else{
                console.log("Email sent successfully.")
            }

          }) 
     }catch(error){
        console.log(error.message);
    }
}



//method to display view
const loadRegister = async (req, res) => {
    try {

        res.render('registration')

    } catch (error) {
        
        console.log(error.message)
    }
}

const loadverifyOtp = async (req, res) => {
    try {

        res.render('verifyOtp')

    } catch (error) {
        
        console.log(error.message)
    }
}

//method to register insert user

const insertUser=async(req,res)=>{
    try{
        const secPassword= await securePassword(req.body.password );
        const user=User({

            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            image:req.file.filename,
            password:secPassword
        });

        const userData=await user.save();

        if(userData){

            //generate otp
            const otp=generateOTP();
            console.log(otp);

          //save otp in db
          const userOTP=await new  UserOTPVerification({
                user_id:userData.user_id,
                otp:otp,
                createdAt:Date.now(),
                expiresAt:Date.now()+3600000

          });

          //save otp record
           await userOTP.save();
           console.log("otp saved");
          
        //sending otp by mail
            sendOTPByMail(req.body.email,otp);
     //res.render('veryfyOtp')
          //  res.render('registration',{message:"Your registration has been successful.Your OTP has been sent.Please check yuor mail. "})
          res.render('verifyOtp')
        }
        else{
            res.render('registration',{message:"Your registration has been failed"})
        }

    }catch(error){
        console.log(error.message)
    }
}
//verification of otp
const verifyOtpMail=(res,req)=>{

//res.render('verifyOtp',"hello");
}
module.exports = {
    loadRegister,
    insertUser,
    loadverifyOtp
}