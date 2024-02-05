// const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');


const userSchema= new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:String,
        required:true      
    },
    password:{
        type:String,
        required:true
    },
    is_blocked:{
        type:Number,
       default:0
    },
    is_verified:{
        type:Number,
       default:0
    },
    wallet_Balance:{
        type:Number,
        default:0
    },
   coupon_Code:{type : Array ,
   default : [] }
   ,
    cart_Data:[{
        product_Id:String,
        name:String,
        quantity:Number,
        price:Number,
        image:String
        
    }],
    wishlist_Data:[{
        product_Id:String,
        name:String,
        quantity:Number,
        price:Number,
        image:String
    
    }],
    address:[{
        FullName:String,
        HouseName:String,
        StreetName:String,
        City:String,
        State:String,
        Country:{type:String,default:'India'},
        Pincode:String,
        ContactNumber:String,
        isDefault:Boolean          
    }],
    token:{
        type:String,
        default:''
    },
    isOrdered:{
        type:Number,
        default:0
    },
    referral_Code:{
        type:String,
        default:''
    },
    wallet_History:[{
        order_id:String,
        returned_Amount:{
         type:Number,
        default:0
        },
        deducted_Amount:{
         type:Number,
        default:0
         },
        updated_Date:Date,
        reason:String
    }]   
},{ strict: false });
module.exports=mongoose.model('User',userSchema)

