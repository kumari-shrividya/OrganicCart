//route
const wishlist_route = require("../routes/wishlistRoute");
//models
const product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const date = require("date-and-time");

const fs = require("fs");
const path = require("path");

//date format
const now = new Date();
const dateValue = date.format(now, "DD/MM/YYYY HH:mm:ss");



//add to wish list
const add_To_Wishlist = async (req, res) => {

     try{

          const Product = await product.findOne({ _id: req.params.id });

          let Qty = Product.quantity;

		   Qty = Qty || 0;

          if (Qty <= 0) {
            return res.json({ success: false, message: "Insufficient stock" });
          }

          //if wishlist is empty ,insert new item
        if (typeof req.session.wishlist === "undefined") {

            req.session.wishlist = [];

            req.session.wishlist.push({

              product_Id: Product._id,
              name: Product.title,
              price: Product.unit_price,
              quantity: 1,
              image: Product.images[0],

            });

            
            //update user wishlist
            await User.updateOne(

              { _id: req.session.user_id },
              { $push: { wishlist_Data: req.session.wishlist } }
            );

            const userData = await User.findOne({ _id: req.session.user_id });

            if (userData) {

              req.session.wishlist = userData.wishlist_Data;

              res.json({
                success: true,
                PId: req.params.id,
                message: "Added To Wishlist",
              });

            }
        } 
		else {

            //if wishlist is not empty , check if there is already same item in wishlist
            let wishlist_Data = req.session.wishlist;
            var newItem = true;

            for (i = 0; i < wishlist_Data.length; i++) {
              if (wishlist_Data[i].product_Id === req.params.id) {
                newItem = false;
                break;
              }
            }

            //if wishlist is not empty and  item  is new ,add new item

            if (newItem) {
              wishlist = [];

              wishlist.push({

                product_Id: Product._id,
                name: Product.title,
                price: Product.unit_price,
                quantity: 1,
                image: Product.images[0],

              });

              //update user wishlist
              await User.updateOne(
                { _id: req.session.user_id },
                { $push: { wishlist_Data: wishlist } }
              );

              const userData = await User.findOne({ _id: req.session.user_id });

              if (userData) {
                req.session.wishlist = userData.wishlist_Data;
                const length = req.session.wishlist.length;
                return res.json({
                  success: true,
                  PId: req.params.id,
                  length,
                  message: "Added To Wishlist",
                });
              }
            } else {
              return res.json({
                success: true,
                PId: req.params.id,
                message: "Already exists in wishlist!",
              });
            }
          } //else wishlist is not empty

        } catch (error) {
          return res.json({ success: false, message: error.message });
        }
};

//clear entire wishlist
const clearWishlist = async (req, res) => {
 
		try {
			const wishlist = req.session.wishlist;

			//clear User collection cart_data[]
			await User.updateOne(

			{ _id: req.session.user_id },
			{ $set: { wishlist_Data: [] } }

			);

			if (typeof req.session.wishlist !== "undefined") {
			
			req.session.wishlist.length = 0; //clear wishlist array

			}
			const userData = await User.findOne({ _id: req.session.user_id });

			if (userData) {

			 res.render("wishlist", {
				user: userData,
				cart: req.session.cart,
				wishlist: req.session.wishlist,

			});
		}
		} catch (error) {
			console.log(error);
			return res.status(500).send("Server Error");
		}
};

const incrimentItemQuantity = async (req, res) => {

	try{
				let productId = req.params.id;
				let proData = await product.findOne({ _id: productId });

				//stock
				let Qty = proData.quantity || 0;
				let unitPrice;

				let incrimentedQuantity, incrimentedSubTotal;

				let wishlist = req.session.wishlist;
				const user_Id = req.session.user_id;

		if (typeof wishlist !== "undefined") {

			for (i = 0; i < wishlist.length; i++) {

				if (wishlist[i].product_Id === productId) {

					//if out of stock
					if (Qty <= 0) {

						return res.json({ success: false, message: "insufficient stock" });
					} 
					else {

						wishlist[i].quantity++;
						incrimentedQuantity = wishlist[i].quantity;
						unitPrice = wishlist[i].price;
						incrimentedSubTotal = incrimentedQuantity * unitPrice;

						await User.updateOne(

						{ _id: user_Id, "wishlist_Data.product_Id": req.params.id },
						{ $set: { "wishlist_Data.$.quantity": wishlist[i].quantity } }
						);
					}

					break;
				}
			}

				const userData = await User.findOne({ _id: req.session.user_id });

				if (userData) {

					req.session.wishlist = userData.wishlist_Data;
					let wishlistData = req.session.wishlist;

					let wishlistLength = wishlistData.length;

					//calculate grandtotal
					let totalSum = 0;
					for (i = 0; i < wishlistData.length; i++) {
					totalSum =
						totalSum + wishlistData[i].quantity * wishlistData[i].price;

					}


					res
					.status(200)
					.json({
						success: true,
						quantity: incrimentedQuantity,
						grandTotal: totalSum,
						PId: productId,
						subTotal: incrimentedSubTotal,
						wishlistLength: wishlistLength,
					});
				}
		}
	} catch (error) {

	 return res.json({ success: false, message: error.message });
	}
};


//=====================decriment wishlist============
const decrimentItemQuantity = async (req, res) => {

		try {

			let productId = req.params.id;

			let proData = await product.findOne({ _id: productId });
			
			//stock
			let Qty = proData.quantity || 0;
			let unitPrice;

			let decrimentedQuantity, decrimentedSubTotal;

			let wishlist = req.session.wishlist;
			const user_Id = req.session.user_id;

			if (typeof wishlist !== "undefined") {
			for (i = 0; i < wishlist.length; i++) {
				if (wishlist[i].product_Id === productId) {
				wishlist[i].quantity--;
				decrimentedQuantity = wishlist[i].quantity;
				unitPrice = wishlist[i].price;
				decrimentedSubTotal = decrimentedQuantity * unitPrice;

				//remove product from cart
				if (wishlist[i].quantity == 0) {
					wishlist.splice(i, 1);

					//remove product from cart_data[]
					await User.updateOne(
					{ _id: req.session.user_id },
					{ $pull: { wishlist_Data: { product_Id: productId } } }
					);
				} else {
					await User.updateOne(
					{ _id: user_Id, "wishlist_Data.product_Id": req.params.id },
					{ $set: { "wishlist_Data.$.quantity": wishlist[i].quantity } }
					);
				}

				break;
				}
			}

			if (wishlist.length == 0) {
				delete req.session.wishlist;

				return res
				.status(200)
				.json({
					success: true,
					quantity: 0,
					grandTotal: 0,
					PId: productId,
					subTotal: 0,
					wishlistLength: 0,
				});
     }

      const userData = await User.findOne({ _id: req.session.user_id });
      if (userData.wishlist_Data) {
        req.session.cart = userData.wishlist_Data;
        let wishlistData = req.session.wishlist;
        let wishlistLength = wishlistData.length;

        //calculate grandtotal
        let totalSum = 0;
        for (i = 0; i < wishlistData.length; i++) {
          totalSum =
            totalSum + wishlistData[i].quantity * wishlistData[i].price;
        }
        res
          .status(200)
          .json({
            success: true,
            quantity: decrimentedQuantity,
            grandTotal: totalSum,
            PId: productId,
            subTotal: decrimentedSubTotal,
            wishlistLength: wishlistLength,
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};



//load wishlist
const loadWishlist = async (req, res) => {

	try {
		
		const userData = await User.findOne({ _id: req.session.user_id });

		return res.render("wishlist", {
			user: userData,
			cart: req.session.cart,
			wishlist: req.session.wishlist,
		});

  } catch (error) {
    return res.status(500).send("Server Error");
  }
};

// add to cart
const add_To_Cart = async (req, res) => {

			try {
				let Qty;
				let Product;
				const id = req.params.id;
				let wishListToCart = [];
				wishListToCart = req.session.wishlist;

			if (Array.isArray(wishListToCart)) {

				for (i = 0; i < wishListToCart.length; i++) {
					if (wishListToCart[i].product_Id === id) {
					Product = wishListToCart[i];
					break;
					}
				}
			}

				if (Product) {
				Qty = Product.quantity;
				Qty = Qty || 0;
				}

				if (Qty <= 0) {
				return res.send({ error: "Insufficient stock" });
				}

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

				//update db user cart
				await User.updateOne(
					{ _id: req.session.user_id },
					{ $push: { cart_Data: req.session.cart } }
				);

				//remove wishlist item

				for (i = 0; i < req.session.wishlist.length; i++) {

					if (req.session.wishlist[i].product_Id === id) {

					 req.session.wishlist.splice(i, 1);
					}
					break;
				}

				//remove product from db  wishlist_Data[]
				await User.updateOne(
					{ _id: req.session.user_id },
					{ $pull: { wishlist_Data: { product_Id: id } } }
				);

				//update stock
				await product.findByIdAndUpdate(Product._id, {
					$inc: { quantity: -1 },
				});


				const userData = await User.findOne({ _id: req.session.user_id });

				if (userData) {
					req.session.cart = userData.cart_Data;
					res.render("wishlist", {
					user: userData,
					cart: req.session.cart,
					wishlist: req.session.wishlist,
					isAddedToCart: true,
					});
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
						{ _id: req.session.user_id, "cart_Data.product_Id": req.params.id },
						{ $set: { "cart_Data.$.quantity": cart[i].quantity } }
					    );

					 //remove wishlist item
					 for (i = 0; i < req.session.wishlist.length; i++) {
						if (req.session.wishlist[i].product_Id === id) {
						req.session.wishlist.splice(i, 1);
						}
						break;
					}

						//remove product from wishlist_Data[]
						await User.updateOne(
							{ _id: req.session.user_id },
							{ $pull: { wishlist_Data: { product_Id: id } } }
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

				for (i = 0; i < req.session.wishlist.length; i++) {
					if (req.session.wishlist[i].product_Id === id) {
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
				} //if new item

				const userData = await User.findOne({ _id: req.session.user_id });

				if (userData) {
					req.session.cart = userData.cart_Data;
					req.session.wishlist = userData.wishlist_Data;
					res.render("wishlist", {
					user: userData,
					cart: req.session.cart,
					wishlist: req.session.wishlist,
					});
				}
				}
			} catch (error) {
				return res.status(500).send("Server Error");
			}
};

module.exports = {
  add_To_Wishlist,
//   incrimentItemQuantity,
  decrimentItemQuantity,
//   removeItem,
//   updateWishlist,
  clearWishlist,
  loadWishlist,
  add_To_Cart,
  
};
