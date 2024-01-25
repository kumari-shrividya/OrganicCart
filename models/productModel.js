// const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');


const productSchema= new mongoose.Schema({

    title:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    unit_price:{
        type:Number,
        required:true
    },
    Weight:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
      images:{ type : Array ,
         default : [] 
        },
     category_id: { type: mongoose.Types.ObjectId ,
         required: true, 
         ref: 'categories' 
        },
     unlisted:{
            type:Number,
            default:0
        }
   
});
module.exports=mongoose.model('product',productSchema)

