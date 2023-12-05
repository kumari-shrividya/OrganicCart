

const express=require('express');
const app=express();

require('dotenv').config();
var mongourl=process.env.MONGO_URL;

const mongoose=require('mongoose');

mongoose.connect(mongourl);

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')))

//for user routes
const userRoute=require('./routes/userRoute');
app.use('/',userRoute); 

app.listen(3000,()=>{
    console.log("server is running");   
})
