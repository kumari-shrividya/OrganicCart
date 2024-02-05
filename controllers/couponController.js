const coupon = require('../models/couponModel');


//load coupon
  
const loadCoupon=async (req,res)=>{
    try{
      res.render('addCoupon',{data:'',error:''});
    }
    catch(error){
      console.log(error);
      
    }
  
  
    }

   //post  add coupon
const addCoupon = async (req, res) => {

    try {
      
           const Coupon = coupon({
            code: req.body.code,
            description: req.body.description,
            offerPrice: req.body.offerPrice,
            minimumAmount:req.body.minimumAmount,
            expiryDate:req.body.expiryDate
        });
            const couponData = await Coupon.save();
             const coupons=await coupon.find({});
            if(coupon){
                  res.render('couponList',{coupons:coupons,isAdded:true}); 
              }
        }
    catch(error){
        
        if (error.name === 'MongoServerError' && error.code === 11000) {
         res.send('coupon must be unique');
        }
        console.log(error);
       // res.json({ success: false, message: 'Category saved successfully' });
    }
    }


    //coupon List
   const loadCouponList=async(req,res)=>{
    try{
        const coupons=await coupon.find({});
      if(coupons){
        const itemsperpage = 3;
          const currentpage = parseInt(req.query.page) || 1;
          const startindex = (currentpage - 1) * itemsperpage;
          const endindex = startindex + itemsperpage;
          const totalpages = Math.ceil(coupons.length / 3);
          let currentCoupon = coupons.slice(startindex,endindex);
          
            res.render('couponList',{coupons:currentCoupon,totalpages,currentpage});

        }
     }catch(error){
      console.log(error)
      return res.status(500).send("Server Error");
    }
}


   
  
//Exports    
module.exports={
        loadCoupon,
        addCoupon,
        loadCouponList,
       // loadUserCouponList
    }