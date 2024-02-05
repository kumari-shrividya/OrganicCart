//route
const cart_route = require("../routes/cartRoute");
//models
const product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const date = require("date-and-time");
const Coupon = require('../models/couponModel');
const Referral=require('../models/referralModel')

const fs=require('fs');
const path=require('path');
//razorpay
const Razorpay = require("razorpay"); 
const { sendReferralLink } = require("./userController");
//razorpay key
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;    
//razorpay instance
var razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
}); 


//date format
const now = new Date();
const dateValue = date.format(now, "DD/MM/YYYY HH:mm:ss");


//add to wish list



// add to cart
const add_To_Cart = async (req, res) => {
  try {
    const Product = await product.findOne({ _id: req.params.id }); 

    // if( Product){
    let Qty = Product.quantity;
    Qty = Qty || 0;
    console.log(Qty);
    // debugger
    if (Qty <= 0) {
      return res.send({ error: "Insufficient stock" });
    } else {
      //if cart is empty ,insert new item ,reduce stock by 1
      if (typeof req.session.cart === "undefined") {
        req.session.cart = [];

        req.session.cart.push({
          product_Id: Product._id,
          name: Product.title,
          unit_price: Product.unit_price,
          quantity: 1,
          image: Product.images[0],
        });
        //update user cart
        await User.updateOne(
          { _id: req.session.user_id },
          { $push: { cart_Data: req.session.cart } }
        );
        //update stock
        await product.findByIdAndUpdate(Product._id, {
          $inc: { quantity: -1 },
        });
        // console.log(req.session.cart);

        console.log("product added");
        const userData = await User.findOne({ _id: req.session.user_id });
        if (userData) {
          req.session.cart = userData.cart_Data;
          res.render("checkout", { user: userData, cart: req.session.cart });
        }
      } else {
        //if there is already same item in cart , incriment Qty,reduce stock by 1
        let cart = req.session.cart;
        var newItem = true;
        for (i = 0; i < cart.length; i++) {
          if (cart[i].product_Id === req.params.id) {
            cart[i].quantity += 1;
            newItem = false;
            //update User collection cart
            await User.updateOne(
              {
                _id: req.session.user_id,
                "cart_Data.product_Id": req.params.id,
              },
              { $set: { "cart_Data.$.quantity": cart[i].quantity } }
            );

            //update product stock
            await product.findByIdAndUpdate(Product._id, {
              $inc: { quantity: -1 },
            });
            break;
          }
        }
        //if cart is not empty and  item  is new ,add new item and reduce stock by 1
        req.session.cart = cart;
        if (newItem) {
          cart = [];
          cart.push({
            product_Id: Product._id,
            name: Product.title,
            price: Product.unit_price,
            quantity: 1,
            image: Product.images[0],
          });
          //update user cart
          await User.updateOne(
            { _id: req.session.user_id },
            { $push: { cart_Data: cart } }
          );
          //update stock
          await product.findByIdAndUpdate(Product._id, {
            $inc: { quantity: -1 },
          });
          // req.session.cart=cart;
        } //if new item

        console.log("product added");
        const userData = await User.findOne({ _id: req.session.user_id });
        if (userData) {
          req.session.cart = userData.cart_Data;
          // console.log(user.cart_Data);

          //res.send("Product added to cart");
          // res.redirect('/all_products');
          res.render("checkout", { user: userData, cart: req.session.cart,wishlist:req.session.wishlist });
        }
      } //else cart is not empty
    } //else Qty>0
    //try
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
}; // end Add To Cart fn




//load checkout
const loadCheckout = async (req, res) => {
  try {
    // console.log(req.session.user_id);
    const userData = await User.findOne({ _id: req.session.user_id });

    // if(userData.cart_Data.length !==0){
    // req.session.cart=userData.cart_Data;
    res.render("checkout", { user: userData, cart: req.session.cart });
    //}
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};



//updating cart
const updateCart = async (req, res) => {
  try {
    var productId = req.params.id;
    let proData = await product.findOne({ _id: productId });
    let Qty = proData.quantity || 0;
    //console.log(Qty);
    var cart = req.session.cart;
    var action = req.query.action;
    const user_Id = req.session.user_id;
    // if session.cart not empty
    if (typeof req.session.cart !== "undefined") {
      for (i = 0; i < cart.length; i++) {
        if (cart[i].product_Id === productId) {
          switch (action) {
            case "add":
              {
                //if out of stock
                if (Qty <= 0) {
                  return res.status(400).send({ error: "Insufficient stock" });
                } else {
                  cart[i].quantity++;
                  await User.updateOne(
                    { _id: user_Id, "cart_Data.product_Id": req.params.id },
                    { $set: { "cart_Data.$.quantity": cart[i].quantity } }
                  );

                  //update stock
                  await product.findByIdAndUpdate(productId, {
                    $inc: { quantity: -1 },
                  });
                }

              }
              break;
            case "remove":
              {
                cart[i].quantity--;
                //remove product from cart
                if (cart[i].quantity == 0) {
                  cart.splice(i, 1);
                  //remove product from cart_data[]
                  await User.updateOne(
                    { _id: req.session.user_id },
                    { $pull: { cart_Data: { product_Id: productId } } }
                  );
                  //{ $pull: { cart_Data: { $elemMatch: { quantity: 1 } } } });
                  await product.findByIdAndUpdate(productId, {
                    $inc: { quantity: 1 },
                  });
                } else {
                  await User.updateOne(
                    {
                      _id: req.session.user_id,
                      "cart_Data.product_Id": req.params.id,
                    },
                    { $set: { "cart_Data.$.quantity": cart[i].quantity } }
                  );
                  //update stock
                  await product.findByIdAndUpdate(productId, {
                    $inc: { quantity: 1 },
                  });
                  if (cart.length == 0) {
                    delete req.session.cart;
                  }
                }
              }
              break;
            //clear the product from cart
            case "clear":
              {
                const Qty = cart[i].quantity;
                cart.splice(i, 1);
                if (cart.length == 0) {
                  delete req.session.cart;
                }
                //remove product object from array
                await User.updateOne(
                  { _id: req.session.user_id },
                  { $pull: { cart_Data: { product_Id: req.params.id } } }
                );
                //update stock
                const prodData = await product.findByIdAndUpdate(productId, {
                  $inc: { quantity: Qty },
                });
                if (prodData) {
                  console.log(prodData.quantity);
                }
              }
              break;
            default:
              console.log("update error");
          }
          break;
        }
      }

      const userData = await User.findOne({ _id: req.session.user_id });
      if (userData) {
        req.session.cart = userData.cart_Data;
        // console.log(userData.cart_Data);
      }
      res.render("checkout", { user: userData, cart: req.session.cart });
      // loadCheckout();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};



//clear entire cart
const clearCart = async (req, res) => {
  //const id=(req.params.id);
  try {
    const cart = req.session.cart;
    //clear User collection cart_data[]
    await User.updateOne(
      { _id: req.session.user_id },
      { $set: { cart_Data: [] } }
    );

    //update stock in product collection
    if (typeof req.session.cart !== "undefined") {
      for (i = 0; i < cart.length; i++) {
        // find product and  incriment the  quantity
        await product.findByIdAndUpdate(cart[i].product_Id, {
          $inc: { quantity: cart[i].quantity },
        });
      }
      req.session.cart.length = 0;
    }

    res.send("Successfully cleared the cart.");
    const userData = await User.findOne({ _id: req.session.user_id });

    // or splice(0, arr. length);
    if (userData) {
      // console.log(userData.cart_Data);
      res.render("checkout", { user: userData, cart: req.session.cart });
    }
  } catch (error) {
    //res.send("Failed");
    console.log(error);
    return res.status(500).send("Server Error");
  }
};




//load place Order
const loadOrderSummary = async (req, res) => {
  try {
    const total_Amt = req.query.total;
    req.session.total = total_Amt;
    const userData = await User.findOne({ _id: req.session.user_id });
    //console.log(req.session.user_id);
       //if user data and address available
    if (userData) {

       if(Array.isArray(userData.address) && userData.address.length){
       // console.log(userData.address);
        //find default address
        const Address = userData.address;

           req.session.bill_Adress = [];

        const length = Address.length;
        req.session.discount=0;
        // var bill_Adress = [];
        for (i = 0; i < length; i++) {  
          if (Address[i].isDefault === true) {
           //bill_Adress = [...bill_Adress, Address[i]];
            req.session.bill_Adress = [...req.session.bill_Adress, Address[i]];
            break;
          }
        }
        //if no default address,take first address
        if (Array.isArray( req.session.bill_Adress) && !req.session.bill_Adress.length ) 
        {
          //req.session.bill_Adress = [...req.session.bill_Adress, Address[0]];
          req.session.bill_Adress= userData.address[0];
        }
        
        //console.log("address",req.session.bill_Adress);
        // res.render("placeOrder", {
        //   user: userData,
        //   bill_address: req.session.bill_Adress,
        //   cart: req.session.cart,
        //   total: total_Amt,
        // });

        res.render("checkoutAndPlace", {
          user: userData,
          bill_address: req.session.bill_Adress,
          cart: req.session.cart,
          total: total_Amt,
          discount:0
        });

       
      } 
      else {
        req.session.bill_Adress = [];
       //res.redirect('/address/addAddress');
       res.render("checkoutAndPlace", {
        user: userData,
        bill_address: req.session.bill_Adress,
        cart: req.session.cart,
        total: total_Amt,
        discount:0
      });

      }

    } else {
      res.send("No data available");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};



//place order
const placeOrder = async (req, res) => {
  try {
    var user_Id = req.session.user_id;
    // console.log(req.body["payment"]);
    // console.log(user_Id);
    var total = req.session.total;
    var amount_Payable;
    const addressData = req.session.bill_Adress;
    //console.log(addressData);
    const userData = await User.findOne({ _id: user_Id });
    
    if (addressData && userData.cart_Data) {
      req.session.username=userData.name;
      // const cartData=req.session.cart;
      let payment_Method = "";
      let order_Status = "";
      //if wallet checked
      if (req.body["chkwallet"]) {
        var wallet_Amt = req.session.wallet;
        if (wallet_Amt > 0) {
          //amount_Payable=parseFloat(total)-parseFloat(wallet_Amt);
          var amount_From_Wallet;
          if (parseFloat(total) <= parseFloat(wallet_Amt)) {
            amount_From_Wallet = total;
            amount_Payable = 0;
            req.session.amount_From_Wallet = amount_From_Wallet;
          } else {
            amount_From_Wallet = wallet_Amt;
            amount_Payable = parseFloat(total) - parseFloat(req.session.amount_From_Wallet);
            req.session.amount_From_Wallet = amount_From_Wallet;
          }
        } else {
          amount_From_Wallet = 0;
          amount_Payable = total;
          req.session.amount_From_Wallet = amount_From_Wallet;
        }
      }
      else {
        amount_From_Wallet = 0;
        amount_Payable = total;
        req.session.amount_From_Wallet = amount_From_Wallet;
      }
      if (req.body["payment"] === "COD") {
        payment_Method = "Cash On Delivery";
        order_Status = "Placed";
      } else if (req.body["payment"] === "OnlinePayment") {
        payment_Method = "Online";
        order_Status = "Pending";
      }
      //  else {
      //   payment_Method = "Wallet";
      //   order_Status = "Placed";
      // }
      var cart = userData.cart_Data;

      const orderaddress = {
        HouseName: addressData.HouseName,
        StreetName: addressData.StreetName,
        City: addressData.City,
        State: addressData.State,
        Pincode: addressData.Pincode,
        ContactNumber: addressData.ContactNumber,
      };
      const order = Order({
        user_Id: user_Id, //'6560d25be15cd5c6d3271103',
        order_Date: dateValue,
        delivery_Date: date.addDays(now, 1), //add 1 day
        total_Amount: total,
        products: cart,
        delivery_Address: orderaddress,
        payment_Method: payment_Method,
        order_Status: order_Status,
        amount_Payable: amount_Payable,
        //coupon_Code:
      });
      const orderData = await order.save();
      //    console.log(orderData._id);
      if (orderData) {
        const updatedData = await User.updateOne(
          { _id: user_Id },
          { $set: { cart_Data: [] } }
        );
          req.session.order_Id=orderData._id;

        if (updatedData) {
          req.session.cart = [];
        }

        // if first order check it is referral and if yes add 50 to wallet of both users
        console.log(userData.isOrdered)
        if(userData.isOrdered===0){

            const refData=await Referral.findOne({referred_email:userData.email});

            if(refData){
              console.log(refData)
            let  userId=refData.user_id;

              let wallet = [];
              wallet.push({
                order_id: order._id,
                returned_Amount:50,
                reason:"Referral Offer",
                updated_Date: Date(),
              });
              //if referral user  incriment user wallet_balance and push details into  wallet history array
              await User.updateMany(
                { _id: req.session.user_id },
                {
                  $push: { wallet_History: wallet },
                  $inc: { wallet_Balance: 50 }, 
                },
                { new: true }
              );

              await User.updateMany(
                { _id: userId },
                {
                  $push: { wallet_History: wallet },
                  $inc: { wallet_Balance: 50 }, 
                },
                { new: true }
              );

           }

           // update isOrdered to 1 in User

           await User.updateMany(
            { _id: req.session.user_id },
            {$set:{isOrdered:1}},
             
            { new: true }
          );

        }

        //if wallet checked for payment 
        if (req.body["chkwallet"] && wallet_Amt > 0) {
          let wallet = [];
          wallet.push({
            order_id: order._id,
            deducted_Amount: amount_From_Wallet,
            reason:"deducted for order",
            updated_Date: Date(),
          });
          //if wallet checked decriment user wallet_balance and push details into  wallet history array
          await User.updateMany(
            { _id: req.session.user_id },
            {
              $push: { wallet_History: wallet },
              $inc: { wallet_Balance: -amount_From_Wallet },
            },
            { new: true }
          );
        }

        //if COD
        if (req.body["payment"] === "COD") {
          console.log("Order  Placed");
          // res.send("Your order has been placed successfully");
          req.session.amount_Payable=amount_Payable;
          res.render("orderSuccess", { amount_Payable: amount_Payable, orderId:req.session.order_Id});
        }
    

        //online payment
        else {
          res.render("onlinePayment", {
            orderId: orderData._id,
            total: amount_Payable,
          });
        }
      }
      // no address data or cart data
    } else {
      
      res.send("Invalid Data");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
    
  }
};



//onlinePayment
const onlinePayment = async (req, res) => {
  console.log("onlinepayment");
  try {
    const amount = req.body.total * 100;
    const orderid = req.body.orderId;

    var options = {
      amount: amount,
      currency: "INR",
      receipt: "organicCart@gmail.com", //""+orderid
    };
    razorpayInstance.orders.create(options, function (err, order) {
      if (!err) {
        console.log(order);
        res.send({
          success: true,
          msg: "order created",
          amount: amount,
          key_id: RAZORPAY_ID_KEY,
        });
      } else {
        console.log(err);
       return res.send({ success: false, msg: "something went wrong" });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};



//load select payment method
const loadPayment = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.session.user_id });
    let wallet = 0;

    // address updated  from ordersummary
    const orderAddress=req.body
    req.session.bill_Adress=orderAddress;
    console.log(req.session.bill_Adress);

    if (
      userData.wallet_Balance !== "undefined" ||
      userData.wallet_Balance !== null
    ) {
      wallet = userData.wallet_Balance;
      req.session.wallet = wallet;
      
    }
    let orderTotal=req.session.total;
    res.render("payment", { wallet: wallet,orderTotal:orderTotal });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};



//load online payment order success
const loadOrderSuccess = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.session.order_Id,
      { order_Status: "Placed" },
      { new: true }
    );
      if(order){
              
      res.render("orderSuccess", { amount_Payable:req.session.amount_Payable });
     }
    
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};




//load getInvoice
const loadGetInvoice=async(req,res)=>{
  const order = await Order.findOne({_id:req.session.order_Id});
  let username=req.session.username;
 
    if(order){
      
      console.log("invoiceorder",username);
      getInvoice(order,username,res);
    }
 }



//method to get Invoice
const getInvoice=async(order,username,res)=>{
  var easyinvoice = require('easyinvoice');
  
 
    try{
      const products=order.products;
      let productList=[];
      productList= order.products.map((product) => ({
       "quantity": product.quantity,
       "description": product.name,
       "tax-rate": 0,
       price: product.price,
     }));
     var data={
    "sender": {
      "company": "Organic Cart",
      "address": " Street 123",
      "zip": "560064",
      "city": "Bangalore",
      "country": "India"
  },
  "client": {
    "company": username,
    "address": order.delivery_Address[0].HouseName,
    "zip": order.delivery_Address[0].Pincode,
    "city": order.delivery_Address[0].City,
    "country": order.delivery_Address[0].Country
},
"information": {
  // Invoice number
  "number": order._id,
  // Invoice data
  "date": order.order_Date.toLocaleString(),
  // Invoice due date
  "due-date": order.delivery_Date.toLocaleString()
},
"products":productList,
"settings":{
  "taxNotation":"vat"
}

};
let result= await easyinvoice.createInvoice(data, async function (result) {
  await fs.writeFileSync(`./public/report${Date.now()}.pdf`,result.pdf,'base64');
 console.log("invoice generated");
 res.setHeader('Content-Type', 'application/pdf');
 res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
 res.end(Buffer.from(result.pdf, 'base64'));
 //res.send(result.pdf);
  });
}catch(error){
  console.log(error);
  res.status(500).send('Internal Server Error');
}

}
//apply promo code
const  applyPromoCode=async (req,res)=>{

  try{


  const couponCode=req.body.promoCode;
 
const userData=await  User.findOne({_id:req.session.user_id});

const isExistCode=0;

if ( Array.isArray( userData.coupon_Code) && userData.coupon_Code.length>0) {

          for (i = 0; i < userData.coupon_Code.length; i++) {
                if ( userData.coupon_Code[i].code === couponCode) {
                   isExistCode=1;
                     res.json("Coupon is already used");
                     console.log("Code  is already used")
                   break;
                   }
              }
  
                if(isExistCode==0){
                          const couponData=Coupon.find({code:couponCode});
                          const discount=couponData.discountPercentage;
                          const expDate=couponData.expiryDate;
                          const minAmt=couponData.minimumAmount;
                          const currentDate = new Date();
                            if(expDate>currentDate){
                                const total=req.session.total;
                                if(total>=minAmt){
                                      let disc=parseInt(total)*parseInt(discount)/100;
                                      req.session.discount=disc;

                                      req.session.total=parseInt(total)-parseInt(disc);
                                      // newData={
                                      //   discount:disc,
                                      //   total:total,
                                      //   message:"Coupon Applied"
                                      // }
                                     // res.json(newData);
                                     await User.updateOne(
                                      { _id: req.session.user_id },
                                      { $push: { coupon_Code: couponCode } }
                                    );

                                     res.render("checkoutAndPlace", {
                                      user: userData,
                                      bill_address: req.session.bill_Adress,
                                      cart: req.session.cart,
                                      total: total,
                                      discount:disc
                                    });
                                      console.log("Coupon Applied")
                                   }
                  
                                  else{
                                    res.json("Total Amount is less");
                                    console.log("Total Amount is less")
                                  }
                              }
                          else{
                            res.json("Coupon expired");
                            console.log("Coupon expired")
                          }
                 }
              else{
                res.json("Coupon is already used");
                console.log("Coupon is already used")
              }

        }
        else{
              console.log("first coupon");

             const couponData=await Coupon.find({code:couponCode});
                          const discount=couponData[0].offerPrice;
                          const expDate=couponData[0].expiryDate;
                          const minAmt=couponData[0].minimumAmount;
                          const currentDate = new Date();
                        if(expDate>currentDate){
                             
                              let total=req.session.total;
                               
                                if(total>=minAmt){
                                      let disc=parseInt(total)*parseInt(discount)/100;
                                      req.session.discount=disc;

                                      req.session.total=parseInt(total)-parseInt(disc);

                                      await User.updateOne(
                                        { _id: req.session.user_id },
                                        { $push: { coupon_Code: couponCode } }
                                      );

                                      // newData={
                                      //   discount:disc,
                                      //   total:total,
                                      //   message:"Coupon Applied"
                                      // }
                                      // res.json(newData);
                                      console.log("Coupon Applied")
                                       res.render("checkoutAndPlace", {
                                        user: userData,
                                        bill_address: req.session.bill_Adress,
                                        cart: req.session.cart,
                                        total: total,
                                        discount:disc
                                      });
                                   }
                  
                                  else{
                                    res.json("Total Amount is less");
                                  }
                    }
                else{
                  res.json("Coupon expired");
                //  console.log(expDate,currentDate);
                  console.log("Coupon expired");
                }

        }

}catch(error){
  res.json(error.message);
}
}

//select Billing address for checkout page
const getBillingAddress=async(req,res)=>{
  const userData = await User.findOne({ _id: req.session.user_id });
  //console.log(req.session.user_id);
     //if user data and address available
  if (userData) {

     if(Array.isArray(userData.address) && userData.address.length){
     // console.log(userData.address);
      //find default address
      const Address = userData.address;

       //  req.session.bill_Adress = [];

      const length = Address.length;
      console.log(req.params.id)
      // var bill_Adress = [];
      for (i = 0; i < length; i++) {  
        if (Address[i]._id.toString() === req.params.id.toString()) {
         
         //bill_Adress = [...bill_Adress, Address[i]];
         req.session.bill_Adress=[];
          req.session.bill_Adress = [...req.session.bill_Adress, Address[i]];
          break;
        }
      }
      console.log(req.session.discount)
      res.render("checkoutAndPlace", {
        user: userData,
        bill_address: req.session.bill_Adress,
        cart: req.session.cart,
        total: req.session.total,
        discount:req.session.discount
      });

    }
  }
}
//Exports
module.exports = {
  add_To_Cart,
  loadCheckout,
  updateCart,
  clearCart,
  loadOrderSummary,
  applyPromoCode,
  getBillingAddress,
  loadPayment,
  placeOrder,
  onlinePayment,
  loadOrderSuccess,
  loadGetInvoice,
 
 };
