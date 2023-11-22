const express=require('express');
const user_route=express();

user_route.set('view engine','ejs');
user_route.set('views','./views/user')

const bodyparser=require('body-parser')
user_route.use(bodyparser.json());
user_route.use(bodyparser.urlencoded({extended:true}))

const multer=require('multer');
const path=require('path');


const storage=multer.diskStorage({

        destination:function(req,file,cb){
            cb(null,path.join(__dirname,'../public/images'));
},
      filename:function(req,file,cb){
         const name=Date.now()+'_'+file.originalname;
          cb(null,name);
}

});

const upload=multer({storage:storage});

const userController=require('../controllers/userController');

user_route.get('/register',userController.loadRegister)
user_route.post('/register',upload.single('image'),userController.insertUser)


user_route.get('/verifyOtp',userController.loadverifyOtp)
//user_route.post('/verifyOtp',userController.verifyOtp)





module.exports=user_route