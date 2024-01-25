// const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');


const catgorySchema= new mongoose.Schema({

    // title:{
    //     type:String,
    //     required:true
    // },
    // description:{
    //     type:String,
    //     required:true
    // },
    // isActive:{
    //     type:Number,
    //     default:1
    // }
    category: { type: String, 
        required: true,
         unique: true },
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

