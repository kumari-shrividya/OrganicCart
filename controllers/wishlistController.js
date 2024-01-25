//route
const wishlist_route = require("../routes/wishlistRoute");
//models
const product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const date = require("date-and-time");

const fs=require('fs');
const path=require('path');


//date format
const now = new Date();
const dateValue = date.format(now, "YYYY/MM/DD HH:mm:ss");


/*---------------- Functions---------------------*/

//add to wish list
const add_To_Wishlist = async (req, res) => {
    try {
      const Product = await product.findOne({ _id: req.params.id });
  
      // if( Product){
      let Qty = Product.quantity;
      Qty = Qty || 0;
      console.log(Qty);
      // debugger
      if (Qty <= 0) {

        return res.send({ error: "Insufficient stock" });

      }
       else {
                //if cart is empty ,insert new item ,reduce stock by 1
                if (typeof req.session.wishlist === "undefined") {
                      req.session.wishlist = [];
  
                     req.session.wishlist.push({
                    product_Id: Product._id,
                    name: Product.title,
                    unit_price: Product.unit_price,
                    quantity: 1,
                    image: Product.images[0],
                });
                    //update user cart
                    await User.updateOne(
                        { _id: req.session.user_id },
                        { $push: { wishlist_Data: req.session.wishlist } }
                    );



          //------------pending starts------
          //update stock check if required for  wishlist
        //   await product.findByIdAndUpdate(Product._id, {
        //     $inc: { quantity: -1 },
        //   });
         //------------pending ends------
          // console.log(req.session.cart);
  
                      console.log("product added");//alert
            //------------pending starts------
                 const userData = await User.findOne({ _id: req.session.user_id });
                if (userData) {
                    req.session.wishlist = userData.wishlist_Data;
                return res.render("wishlist", { user: userData, cart: req.session.cart,wishlist: req.session.wishlist });
                 }
                 //------------pending ends------

                } else {
                        //if there is already same item in cart , incriment Qty,reduce stock by 1
                        let wishlist = req.session.wishlist;
                        var newItem = true;
                        for (i = 0; i < wishlist.length; i++) {
                            if (wishlist[i].product_Id === req.params.id) {
                                wishlist[i].quantity += 1;
                            newItem = false;
                            //update User collection cart
                            await User.updateOne(
                                {
                                _id: req.session.user_id,
                                "wishlist_Data.product_Id": req.params.id,
                                },
                                { $set: { "wishlist_Data.$.quantity": wishlist[i].quantity } }
                            );
                
                                //------------pending starts------
                            //update product stock

                            //   await product.findByIdAndUpdate(Product._id, {
                            //     $inc: { quantity: -1 },
                            //   });
                        //------------pending ends------
                            break;
                            }
          }
          //if cart is not empty and  item  is new ,add new item and reduce stock by 1
          req.session.wishlist = wishlist;
          if (newItem) {
            wishlist = [];
            wishlist.push({
              product_Id: Product._id,
              name: Product.title,
              price: Product.unit_price,
              quantity: 1,
              image: Product.images[0],
            });
            //update user cart
            await User.updateOne(
              { _id: req.session.user_id },
              { $push: { wishlist_Data: wishlist } }
            );

            
                 //------------pending starts------
            //update stock
            // await product.findByIdAndUpdate(Product._id, {
            //   $inc: { quantity: -1 },
            // });

             //------------pending ends------

            // req.session.cart=cart;
          } //if new item
  
          console.log("product added to Wishlist"); //alert
          const userData = await User.findOne({ _id: req.session.user_id });
          if (userData) {
            req.session.wishlist = userData.wishlist_Data;   
            // console.log(user.cart_Data);
  
            //res.send("Product added to cart");
            // res.redirect('/all_products');
         return res.render("wishlist", { user: userData, cart: req.session.cart,wishlist: req.session.wishlist });
          }
        } //else cart is not empty
      } //else Qty>0
      //try
    } catch (error) {
      console.log(error);
      return res.status(500).send("Server Error"); 
    }
  }; //fn




//clear entire wishlist
const clearWishlist = async (req, res) => {
    //const id=(req.params.id);
    try {
      const wishlist = req.session.wishlist;
      //clear User collection cart_data[]
      await User.updateOne(
        { _id: req.session.user_id },
        { $set: { wishlist_Data: [] } }
      );
  
      //update stock in product collection
      if (typeof req.session.wishlist !== "undefined") {
        // for (i = 0; i < wishlist.length; i++) {

        //   // find product and  incriment the  quantity
        //   await product.findByIdAndUpdate(cart[i].product_Id, {
        //     $inc: { quantity: cart[i].quantity },
        //   });
        // }
        req.session.wishlist.length = 0; //clear wishlist array
      }
  
      res.send("Successfully cleared the wishlist.");
      const userData = await User.findOne({ _id: req.session.user_id });
  
      // or splice(0, arr. length);
      if (userData) {
        // console.log(userData.cart_Data);
        // res.render("checkout", { user: userData, cart: req.session.cart });
        res.render('wishlist',{user:userData,cart:req.session.cart,wishlist:req.session.wishlist})

      }
    } catch (error) {
      //res.send("Failed");
      console.log(error);
      return res.status(500).send("Server Error");
    }
  };
  


  
//updating wishlist
const updateWishlist = async (req, res) => {
    try {
      var productId = req.params.id;
      let proData = await product.findOne({ _id: productId });
      let Qty = proData.quantity || 0;
      //console.log(Qty);
      var wishlist = req.session.wishlist;
      var action = req.query.action;
      const user_Id = req.session.user_id;
      // if session.cart not empty
      if (typeof req.session.wishlist !== "undefined") {
        for (i = 0; i < wishlist.length; i++) {
          if (wishlist[i].product_Id === productId) {
            switch (action) {
              case "add":
                {
                  //if out of stock
                  if (Qty <= 0) {
                    return res.status(400).send({ error: "Insufficient stock" });
                  } else {
                    wishlist[i].quantity++;
                    await User.updateOne(
                      { _id: user_Id, "wishlist_Data.product_Id": req.params.id },
                      { $set: { "wishlist_Data.$.quantity": wishlist[i].quantity } }
                    );

                    //update stock
                    // await product.findByIdAndUpdate(productId, {
                    //   $inc: { quantity: -1 },
                    // });

                  }
                }
                break;
              case "remove":
                {
                    wishlist[i].quantity--;
                  //remove product from cart
                  if (wishlist[i].quantity == 0) {
                    wishlist.splice(i, 1);
                    //remove product from cart_data[]
                    await User.updateOne(
                      { _id: req.session.user_id },
                      { $pull: { wishlist_Data: { product_Id: productId } } }
                    );
                    //{ $pull: { cart_Data: { $elemMatch: { quantity: 1 } } } });
                    // await product.findByIdAndUpdate(productId, {
                    //   $inc: { quantity: 1 },
                    // });
                  } else {
                    await User.updateOne(
                      {
                        _id: req.session.user_id,
                        "wishlist_Data.product_Id": req.params.id,
                      },
                      { $set: { "wishlist_Data.$.quantity": wishlist[i].quantity } }
                    );

                    //update stock
                    // await product.findByIdAndUpdate(productId, {
                    //   $inc: { quantity: 1 },
                    // });

                    if (wishlist.length == 0) {
                      delete req.session.wishlist;
                    }
                  }
                }
                break;
              //clear the product from cart
              case "clear":
                {
                  const Qty = wishlist[i].quantity;
                  wishlist.splice(i, 1);
                  if (wishlist.length == 0) {
                    delete req.session.wishlist;
                  }
                  //remove product object from array
                  await User.updateOne(
                    { _id: req.session.user_id },
                    { $pull: { wishlist_Data: { product_Id: req.params.id } } }
                  );

                  //update stock
                //   const prodData = await product.findByIdAndUpdate(productId, {
                //     $inc: { quantity: Qty },
                //   });

                //   if (prodData) {
                //     console.log(prodData.quantity);
                //   }
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
          req.session.wishlist = userData.wishlist_Data;
          res.render('wishlist',{user:userData,cart:req.session.cart,wishlist:req.session.wishlist});
          // console.log(userData.cart_Data);
        }
        // res.render("checkout", { user: userData, cart: req.session.cart });

        // loadCheckout();
      }
    } catch (error) {
      console.log(error);
      return res.status(500).send("Server Error");
    }
  };
  
//load wishlist
const loadWishlist = async (req, res) => {
  try {
    // console.log(req.session.user_id);
    const userData = await User.findOne({ _id: req.session.user_id });

    // if(userData.cart_Data.length !==0){
    // req.session.cart=userData.cart_Data;
    res.render("wishlist", { user: userData, cart: req.session.cart,wishlist:req.session.wishlist });
    //}
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};



// add to cart
const add_To_Cart = async (req, res) => {
  try {

    // const Product = await product.findOne({ _id: req.params.id });
    let Qty;
    let Product;
    const id=req.params.id;
    let wishListToCart=[];
    wishListToCart= req.session.wishlist;
   // console.log(wishListToCart);
    // if (Array.isArray(wishListToCart)) {
    //    Product=wishListToCart.filter(product=>
    //   product.product_Id==req.params.id)
    // }
    console.log(wishListToCart)
    if (Array.isArray(wishListToCart)) {
      for(i=0;i<wishListToCart.length;i++){

        if (wishListToCart[i].product_Id===id ) {

          Product=wishListToCart[i];

          break;
     // req.session.wishlist.splice(i, 1);
     }
      
   }
  }
  

    console.log(Product);
     if( Product){
     Qty = Product.quantity;
    Qty = Qty || 0;
     }
    //console.log(Qty);
    // debugger
    if (Qty <= 0) {
      return res.send({ error: "Insufficient stock" });
    } else {
      //if cart is empty ,insert new item ,reduce stock by 1
      if (typeof req.session.cart === "undefined") {
        req.session.cart = [];

        req.session.cart.push({
          product_Id: Product.product_Id, 
          name: Product.name,
          unit_price: Product.price,
          quantity: Product.quantity,
          image: Product.image,
        });
        //update user cart
        await User.updateOne(
          { _id: req.session.user_id },
          { $push: { cart_Data: req.session.cart } }
        );

          //remove wishlist item
          
          for(i=0;i<req.session.wishlist.length;i++){

            if (req.session.wishlist[i].product_Id===id ) {
              req.session.wishlist.splice(i, 1);
            }
              break;
          }
          //remove product from wishlist_Data[]
          await User.updateOne(
            { _id: req.session.user_id },
            { $pull: { wishlist_Data: { product_Id: id } } }
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
          res.render("wishlist", { user: userData, cart: req.session.cart,wishlist:req.session.wishlist,isAddedToCart:true});
        }
      } else {
        //if there is already same item in cart , incriment Qty,reduce stock by 1
        let cart = req.session.cart;
        var newItem = true;
        for (i = 0; i < cart.length; i++) {
          if (cart[i].product_Id === id) {
            cart[i].quantity += Product.quantity;
            newItem = false;
            //update User collection cart
            await User.updateOne(
              {
                _id: req.session.user_id,
                "cart_Data.product_Id": req.params.id,
              },
              { $set: { "cart_Data.$.quantity": cart[i].quantity } }
            );

              //remove wishlist item
          
              for(i=0;i<req.session.wishlist.length;i++){

                if (req.session.wishlist[i].product_Id===id) {
                  req.session.wishlist.splice(i, 1);
                }
                  break;
              }
              //remove product from wishlist_Data[]
              await User.updateOne(
                { _id: req.session.user_id },
                { $pull: { wishlist_Data: { product_Id: id} } }
              );
          // ===============================    


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
            product_Id: Product.product_Id,
            name: Product.name,
            price: Product.price,
            quantity: Product.quantity,
            image: Product.image,
          });
          //update user cart
          await User.updateOne(
            { _id: req.session.user_id },
            { $push: { cart_Data: cart } }
          );

          //remove wishlist item

          for(i=0;i<req.session.wishlist.length;i++){

            if (req.session.wishlist[i].product_Id===id ) {
              req.session.wishlist.splice(i, 1);
            }
              break;
          }
          //remove product from wishlist_Data[]
          await User.updateOne(
            { _id: req.session.user_id },
            { $pull: { wishlist_Data: { product_Id: id } } }
          );

         // ======================

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
          res.render("wishlist", { user: userData, cart: req.session.cart,wishlist:req.session.wishlist });
        }
      } //else cart is not empty
    } //else Qty>0
    //try
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
}; // end Add To Cart fn



module.exports = { 
    add_To_Wishlist,
    updateWishlist,
    clearWishlist,
    loadWishlist,
    add_To_Cart
}