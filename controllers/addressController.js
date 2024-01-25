//route
const address_route = require('../routes/addressRoute');
//models
const User = require('../models/userModel');
const Order=require('../models/orderModel');
const { HTTPResponse } = require('puppeteer');
const { json } = require('body-parser');

//load addAddress form
const loadAdd_Address = async (req, res) => {
    try {

        const userData = await User.findOne({ _id: req.session.user_id });
        if(userData){
        res.render('addAddress',{user:userData,cart:req.session.cart,errors:'',data:''});
        }
    } catch (error) {
        console.log(error)
        return res.status(500).send("Server Error");
    }
}
//add new address
const add_Address = async (req, res) => {
    try {
         let Address =[];
         Address.push({
            FullName:req.body.FullName,
            HouseName: req.body.HouseName,
            StreetName: req.body.StreetName,
            City:req.body.City,
            State:req.body.State,
            Pincode:req.body.Pincode,
            ContactNumber:req.body.ContactNumber,
            isDefault:true
        });
       const  addData= await User.updateOne({_id:req.session.user_id},
            {$push:{'address':Address}},{"returnDocument":"after"});

            const userData = await User.findOne({ _id: req.session.user_id });
        if(userData){
          //  console.log("Address Added"); 
         //  res.send("Address added"); 
        return res.render('addressList',{user_Id:req.session.user_id,addressList:userData.address,user:userData,cart:req.session.cart,isAdrAdded:true,wishlist:req.session.wishlist});
         }
    }catch(error){
        console.log(error);   
        return res.status(500).send("Server Error");
    }
}
 //load address List
const loadAddressList = async (req, res) => {
        try {
    
            const userData = await User.findOne({ _id: req.session.user_id });
            // if(userData.address){
            //  return res.send("No Address available");
            // }
         if(Array.isArray(userData.address) && userData.address.length>0){
            res.render('addressList',{user_Id:req.session.user_id,addressList:userData.address,user:userData,cart:req.session.cart,wishlist:req.session.wishlist,isAdrAdded:false,isAdrEditted:false,isAdrDeleted:false});
            }
            else{
                //return res.send("Address Not found");
               res.render('addressList',{user_Id:req.session.user_id,addressList:[],user:userData,cart:req.session.cart,wishlist:req.session.wishlist,isAdrAdded:false,isAdrEditted:false,isAdrDeleted:false});
            }
           
        } catch (error) {
            console.log(error);  
            return res.status(500).send("Server Error");   
            //res.send("Server error"); 
        }
}
     //load edit address page
const loadEditAddress = async (req, res) => {
        try {
            const  addressId  = req.params.id;
           // console.log(addressId);
           let address;
            const userData = await User.findOne({ _id: req.session.user_id,"address._id": addressId});

            if(Array.isArray(userData.address) && userData.address.length){
           
                for(i=0;i<userData.address.length;i++){
                    if(userData.address[i]._id.toString()===addressId){
                        address=userData.address[i];
                        break;
                    }
                }
            }
              console.log(address);
            if(!userData){
               return res.send("Address not available");
            }
            else{
          //  console.log(addressId);
                  req.session.editAddressUser=address;
                res.render('editAddress',{user:userData,address_id:addressId,address:address,errors:'',data:'',cart:req.session.cart,wishlist:req.session.wishlist});
               
            }
        } catch (error) {
            console.log(error); 
            return res.status(500).send("Server Error");
            
          }
}
 //change/edit  addess
const updateEditAddress = async (req, res) => {
      try {
        let  addressId  = req.params.id;
        const userData = await User.findOne({ _id: req.session.user_id });
        if(Array.isArray(userData.address) && userData.address.length){
           
            for(i=0;i<userData.address.length;i++){
                if(userData.address[i]._id.toString()===addressId){
                  //console.log(userData.address[i],addressId);
                     let  id=userData.address[i]._id;
                   var result= await User.updateOne({_id:req.session.user_id,
                        "address._id":id},
                        {$set:{
                            "address.$.FullName":req.body.FullName,
                            "address.$.HouseName":req.body.HouseName,
                             "address.$.StreetName":req.body.StreetName,
                             "address.$.City":req.body.City,
                             "address.$.Pincode":req.body.Pincode,
                             "address.$.ContactNumber":req.body.ContactNumber 

                    }});
                 console.log(result)
                    console.log(" address changed successfully");
                    break;
                }
               
             }
           
            const users = await User.findOne({ _id: req.session.user_id });
            if(users){
            res.render('addressList',{user_Id:req.session.user_id,addressList:users.address,user:users,cart:req.session.cart,wishlist:req.session.wishlist,isAdrAdded:false,isAdrEditted:true,isAdrDeleted:false}) ; 
            }
        }
        
    } catch (error) {
        console.log(error); 
       return res.status(500).send("Server error");
    }
}
    //set default address
const set_As_Default = async (req, res) => {
        try {
            const  addressId  = req.params.id;
           // console.log(addressId);
           // console.log(req.session.user_id);
           const user_Data = await User.findOne({ _id: req.session.user_id });
          
            if(!user_Data){
                return res.send("User not found");
            }
            else{

                //const addresses=userData.address;
                user_Data.address.forEach(addr => {
                    addr.isDefault = addr._id.toString() === addressId;
                  });
              
                  // Save the updated address
                  await user_Data.save();

                  const userData = await User.findOne({ _id: req.session.user_id });

                  const Address=userData.address;
                  const length=Address.length;
                  var bill_Adress=[]
                  for(i=0;i<length;i++){
                      if(Address[i].isDefault===true){
                          bill_Adress=[...bill_Adress,Address[i]];
                         req.session.bill_Adress=bill_Adress;
                         break;
  
                      }
                  }
                  //if no default address,take first address
                  if(bill_Adress==='undefined'){
                      req.session.bill_Adress=Address[0];
                  }
                 
                  const users = await User.findOne({ _id: req.session.user_id });
                  if(users){
                  res.render('addressList',{user_Id:req.session.user_id,addressList:users.address,user:users,cart:req.session.cart,wishlist:req.session.wishlist,isAdrAdded:false,isAdrEditted:false,isAdrDeleted:false,isDefault:true}) ; 
                  }
                //  res.send("Default address set successfully");
            
            }
           
        } catch (error) {
            console.log(error);
            return res.status(500).send("Server Error");
         
        }
}
    //delete  addess
const deleteAddress = async (req, res) => {
           try {
                const  addressId  = req.params.id;
               //remove address from address[]
                const result= await User.updateOne(
                 { _id: req.session.user_id },
                 { $pull: { "address": {_id: addressId } } }
                );
                if(result){
                 //   console.log("deleted");
                const users = await User.findOne({ _id: req.session.user_id });
                if(users){
                res.render('addressList',{user_Id:req.session.user_id,addressList:users.address,user:users,cart:req.session.cart,isAdrAdded:false,isAdrEditted:false,isAdrDeleted:true,wishlist:req.session.wishlist}) ; 
                }
            } 
           }
           catch (error) {
          console.log(error);
           return res.status(500).send("Server error");
        }
}
//select address check out
const getCheckoutAddress=async(req,res)=>{
    try {
        const  addressId  = req.params.id;
        // console.log(addressId);
        let address;
         const userData = await User.findOne({ _id: req.session.user_id,"address._id": addressId});

         if(Array.isArray(userData.address) && userData.address.length){
        
             for(i=0;i<userData.address.length;i++){
                 if(userData.address[i]._id.toString()===addressId){
                     address=userData.address[i];
                     break;
                 }
             }
         }
         if(address){
            res.send({
                success: true,
                
                address:address
              });
         }
    } catch (error) {
      console.log(error);
      return res.status(500).send("Server Error");
    }
  }

 //Exports
    module.exports = {
    loadAdd_Address,
    add_Address,
    loadAddressList,
    set_As_Default,
    loadEditAddress,
    updateEditAddress,
    deleteAddress,
    getCheckoutAddress
}
