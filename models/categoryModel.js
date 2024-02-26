// const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');


const catgorySchema= new mongoose.Schema({

    
    category: { type: String, 
        required: true,
       
            unique: true,
            lowercase: true, trim: true, //case insensitive unique
            
      
         },
         offer_Percentage:{type:Number,
        default:0},
    image:{
        type:String,
        required:true
    },
    unlisted:{
            type:Number,
            default:0
        }
     
});

module.exports=mongoose.model('categories',catgorySchema)

