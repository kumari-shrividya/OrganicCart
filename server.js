const express=require('express');
const app=express();

// const session=require('express-session');
// app.use(session({secret:config.sessionSecret,resave:false, saveUninitialized: true}))
require('dotenv').config();
const cors = require('cors');

//db connection
var mongourl=process.env.MONGO_URL;
const mongoose=require('mongoose');
const connectDb=async()=>{
    await mongoose.connect(mongourl)
.then(() => { 
    console.log('Database connected');   
}) 
.catch((err) => { 
    console.log(err.message); 
    console.log('Error in connecting database');   
}); 
};

connectDb();

//cors
app.use(cors());

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type, Accept");
//     next();
// });


// static path public
const path = require('path') 
app.use(express.static(path.join(__dirname, 'public')))      
 
//for user routes  
const userRoute=require('./routes/userRoute');       
app.use('/',userRoute);  

//for admin routes
const adminRoute=require('./routes/adminRoute');       
app.use('/admin', adminRoute); 

//for product routes
const productRoute=require('./routes/productRoute');
app.use('/product',productRoute); 

//for cart routes
const cartRoute=require('./routes/cartRoute');
app.use('/cart',cartRoute); 

//for wishlist routes
const wishlistRoute=require('./routes/wishlistRoute');
app.use('/wishlist',wishlistRoute); 

//for order routes
const orderRoute=require('./routes/orderRoute');
app.use('/order',orderRoute); 

const addressRoute=require('./routes/addressRoute');
app.use('/address',addressRoute); 


app.listen(process.env.PORT,()=>{   
    console.log("server is running");                    
})     
    