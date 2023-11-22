

const express=require('express');
const app=express();

require('dotenv').config();
var mongourl=process.env.MONGO_URL;

const mongoose=require('mongoose');
//mongoose.connect("mongodb+srv://shrividya:iM9YNo2J2av4SN6i@cluster1.nf1wxyp.mongodb.net/ecommerce_organic_cart");
mongoose.connect(mongourl);

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

//for user routes
const userRoute=require('./routes/userRoute');
app.use('/',userRoute); 

app.listen(3000,()=>{
    console.log("server is running");   
})
