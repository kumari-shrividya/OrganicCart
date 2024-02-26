//model
const coupon = require('../models/couponModel');


//load coupon
const loadCoupon=async (req,res)=>{

	try{

		res.render('addCoupon');

	}
	catch(error){
	return res.status(500).send(error.message);
	}
		
 }

 //load edit coupon
 const loadEditCoupon=async (req,res)=>{

      try{

        const id=req.params.id;
        const Coupon=await coupon.find({_id:req.params.id});

        if(Coupon){
        res.render('editCoupon',{Coupon:Coupon});
        }
      }
     catch(error){
	  return res.status(500).send(error.message);
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

            if(couponData){
                  res.json({success:true,message:'Coupon added successfully'});
              }
    }
    catch(error){  
        if (error.name === 'MongoServerError' && error.code === 11000) {
         return res.json({success:false,message:'Coupon Code must be unique!'})
        }
         return  res.json({success:false})

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

  //post  edit coupon
 const editCoupon = async (req, res) => {

    try{
			let id=req.params.id;
			let code=req.body.code;
			let description=req.body.description;
			let offerPrice=req.body.offerPrice;
			let minimumAmount=req.body.minimumAmount;
			let expirationDate=req.body.expiryDate

            const couponData =   await coupon.findOneAndUpdate({_id:req.params.id},{$set:{code:code, 
					description:description,offerPrice:offerPrice,
					minimumAmount:minimumAmount,expiryDate: expirationDate}
		     }); 

             if(couponData){
                  res.json({success:true,message:'Coupon editted successfully.'})
                }
        }
        catch(error){
        return res.json({success:false,message:error.message})
    }
}

//delete coupon
const deleteCoupon=async(req,res)=>{

	try{
		const deletedCoupon = await coupon.findByIdAndDelete(req.params.id);

		if(deletedCoupon){

			const coupons=await coupon.find({});

		 if(coupons){
				
			const itemsperpage = 8;
			const currentpage = parseInt(req.query.page) || 1;
			const startindex = (currentpage - 1) * itemsperpage;
			const endindex = startindex + itemsperpage;
			const totalpages = Math.ceil(coupons.length / 8)
			let currentCoupon = coupons.slice(startindex,endindex);
			res.render('couponList',{coupons:currentCoupon,isDelete:true,totalpages,currentpage});

		} 
	}
	}catch(error){
		return res.send(error.message);
	}
}

//Exports    
	module.exports={

        loadCoupon,
        addCoupon,
		
        loadCouponList,

        loadEditCoupon,
        editCoupon,
		
        deleteCoupon
    }