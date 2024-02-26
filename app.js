const express=require('express');
const app=express();

const PORT=process.env.PORT || 3000;

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

// static path public
const path = require('path') 
app.use(express.static(path.join(__dirname, 'public')))      
 
// user routes  
const userRoute=require('./routes/userRoute');       
app.use('/',userRoute);  

// admin routes
const adminRoute=require('./routes/adminRoute');       
app.use('/admin', adminRoute); 

// product routes
const productRoute=require('./routes/productRoute');
app.use('/product',productRoute); 

// cart routes
const cartRoute=require('./routes/cartRoute');
app.use('/cart',cartRoute); 

//wishlist routes
const wishlistRoute=require('./routes/wishlistRoute');
app.use('/wishlist',wishlistRoute); 

// order routes
const orderRoute=require('./routes/orderRoute');
app.use('/order',orderRoute); 

//address routes
const addressRoute=require('./routes/addressRoute');
app.use('/address',addressRoute); 


app.listen(PORT,()=>{   
    console.log("server is running");                    
})     
    