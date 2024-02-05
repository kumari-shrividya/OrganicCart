const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    offerPrice: {
        type: Number,
        required: true,
    },
    minimumAmount: {
        type: Number,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
    expiryDate: {
        type: Date,
        required: true, 
    },
    user:{
        type:Array,
        userId:{
            type:String
        }
    }
});


couponSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

module.exports=mongoose.model('coupons',couponSchema)
