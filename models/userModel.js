// const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');


const userSchema= new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
      image:{
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
    wallet:{
        type:Number,
        default:0
    },
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
    
    }]

    
});
module.exports=mongoose.model('User',userSchema)

