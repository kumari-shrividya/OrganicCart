//route
const order_route = require("../routes/orderRoute");

//models
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const product = require("../models/productModel");

//load admin OrderList
const loadOrderList = async (req, res) => {

try {
			let page = 1;
			const limit = 15;

          const orderData = await Order.find({}).sort({ order_Date: -1 });
           // .sort({ order_Date: 1 });

        if (orderData) {

          req.session.orderId = orderData.orderId;
          const itemsperpage = 15;
          const currentpage = parseInt(req.query.page) || 1;
          const startindex = (currentpage - 1) * itemsperpage;
          const endindex = startindex + itemsperpage;
          const totalpages = Math.ceil(orderData.length / 15);
          let currentproducts = orderData.slice(startindex, endindex);

          res.render("orders", {
            orders: currentproducts,
            totalpages,
            currentpage,
          });

        }
    }catch (error) {
        return res.status(500).send(error.message);
    }
};


//load my orders
const loadmyOrders = async (req, res) => {

  try {

			const userData = await User.findOne({ _id: req.session.user_id });
			const orderData = await Order.find({ user_Id: req.session.user_id }).sort({
			order_Date: -1,
			});

		if (orderData) {

			const itemsperpage = 8;
			const currentpage = parseInt(req.query.page) || 1;
			const startindex = (currentpage - 1) * itemsperpage;
			const endindex = startindex + itemsperpage;
			const totalpages = Math.ceil(orderData.length / 8);
			let currentorderData = orderData.slice(startindex, endindex);

			res.render("myOrders", {
			user: userData,
			orders: currentorderData,
			cart: req.session.cart,
			message: "",
			totalpages,
			currentpage,
			});
		}

 	 }catch (error) {
    return res.status(500).send(error.message);
  }

};

//load user order details
const loadOrderDetails = async (req, res) => {

	try{
				const order_id = req.params.id;
				const orderData = await Order.findOne({ _id: order_id }).sort({
				order_Date: -1,
				});

		if (orderData) {

			if (!req.session.admin) {

				const userData = await User.findOne({ _id: req.session.user_id });

				res.render("orderDetails", {
				user: userData,
				orders: orderData,
				cart: req.session.cart,
				admin: false,

				});

			} else {

				res.render("orderDetails", {
				user: "",
				orders: orderData,
				cart: "",
				admin: true,
				});
			}
		}

	}catch (error) {
       return res.status(500).send("Server Error");
		}

};


//cancel my order
const cancelMyOrder = async (req, res) => {
  
			try {
				const orderId = req.params.id;

				const result = await Order.updateOne(
					{ _id: orderId },
					{
						$set: {
						order_Status: "Cancelled",
						},
					}
				);

			if (!result) {
				return next(new Error("Not updated"));
				
			} else 
			{
				const order = await Order.findOne({ _id: orderId });
				const products = order.products;
				const total = parseFloat(order.total_Amount);
				const id = order._id;

				if (typeof products !== "undefined") {

					for (i = 0; i < products.length; i++) {

						const productId = products[i].product_Id;
						const qty = products[i].quantity;

						const updated = await product.findByIdAndUpdate(
							productId,
							{
							$inc: { quantity: qty },
							},
							{ new: true }
						);
					}
				}

				let wallet = [];
				wallet.push({
					order_id: order._id,
					returned_Amount: total,
					updated_Date: Date(),
					reason: "Defected",
				});

				//incriment user wallet_balance and push details into  wallet history array
				await User.updateMany(
					{ _id: req.session.user_id },
					{
					$push: { wallet_History: wallet },
					$inc: { wallet_Balance: total },
					},
					{ new: true }
				);

				const userData = await User.findOne({ _id: req.session.user_id });
				const orderData = await Order.find({ user_Id: req.session.user_id }).sort(
					{
					order_Date: -1,
					}
				);

				if (orderData) {

					const itemsperpage = 8;
					const currentpage = parseInt(req.query.page) || 1;
					const startindex = (currentpage - 1) * itemsperpage;
					const endindex = startindex + itemsperpage;
					const totalpages = Math.ceil(orderData.length / 8);
					let currentorderData = orderData.slice(startindex, endindex);

					res.render("myOrders", {

					user: userData,
					orders: currentorderData,
					cart: req.session.cart,
					success: true,
					message: "",
					isCancel: true,
					totalpages,
					currentpage,
					});
				}
			}
	} catch (error) {
		return res.status(500).send("Server Error");
		}
};


//update  order status
const updateOrderStatus = async (req, res) => {

	try{
		const order = await Order.findByIdAndUpdate(req.params.id, {
		order_Status: req.body.status,
		});
		if (!order) {
		return res.status(400).send("Not updated");
		}
	  return res.send("Status updated successfully");
	
		// return res.render()
	}catch (error) {
		return res.status(500).send("Server Error");
	}
};


//send return request of a product in an order
const sendReturnRequest = async (req, res) => {
  try {
			const orderId = req.params.id;
			const prodId = req.query.prod_id;
			const order = await Order.findOne({ _id: req.params.id });
		if (!order) {
		  return res.send("Not found");
		  }
		 else {

			//update product status with 'request for return' for return product from user side
			const products = order.products;

			if (typeof products !== "undefined") {
				for (i = 0; i < products.length; i++) {
				if (products[i].product_Id === prodId) {
					await Order.updateOne(
					{ _id: orderId, "products.product_Id": prodId },
					{
						$set: {
						"products.$.status": "request_for_return",
						order_Status: "request_for_return",
						},
					}
					);
				return	res.send({ message: "request has been sent", success: true });
					//break;
				}
				}
			}
			}
		} catch (error) {
			console.log(error);
			return res.status(500).send("Server Error");
		}
};

//load admin order details
const loadAdminOrderDetails = async (req, res) => {
		try {
			const order_id = req.params.id;
			const orderData = await Order.findOne({ _id: order_id }).sort({
			order_Date: -1,
			});
			
			if (orderData) {
			res.render("adminOrderDetails", {
				user: "",
				orders: orderData,
				cart: "",
				admin: true,
			});
			}
		} catch (error) {
			return res.status(500).send("Server Error");
		}
};

//accept return request by admin
const acceptReturnRequest = async (req, res) => {

  try{
			const orderId = req.params.id;
			const prodId = req.query.prod_id;
			const order = await Order.findOne({ _id: req.params.id });
		if (!order) {
			  return res.send("Not found");
			} 
		else {

			//update product status with 'request for return' for return product from user side
			const total_amt_of_order = order.total_Amount;
			const products = order.products;

			if (typeof products !== "undefined") {

				for (i = 0; i < products.length; i++) {

				if (products[i].product_Id === prodId) {

					let returnedAmt = parseFloat(0);
					let newTotal = parseFloat(0);

					returnedAmt = (
					parseFloat(products[i].quantity) * parseFloat(products[i].price)
					).toFixed(2);

					newTotal = (
					parseFloat(total_amt_of_order) - parseFloat(returnedAmt)
					).toFixed(2);

					//update order collection ,change product status 'returned' ,update total_amt in order
					await Order.updateOne(
					{ _id: orderId, "products.product_Id": prodId },
					{
						$set: {
						order_Status: "accepted_return_request",
						total_Amount: newTotal,
						"products.$.status": "returned",
						},
					}
					);

					//incriment  wallet
					await User.updateOne(
					{ _id: order.user_Id },
					{ $inc: { wallet: returnedAmt } }
					);

					//incrimenting stock of product
					await product.findByIdAndUpdate(prodId, {
					$inc: { quantity: products[i].quantity },
					});

					return res.send({ message: "updated successfully ", success: true });
				//	break;
				}
			  }
			}
		}
		} catch (error) {
			return res.status(500).send("Server Error");
		}
};

//reject return request
const rejectReturnRequest = async (req, res) => {
	
		try {
			const orderId = req.params.id;
			const prodId = req.query.prod_id;
			const order = await Order.findOne({ _id: req.params.id });
			if (!order) {
			return res.send("Not found");
			} else {
			const products = order.products;
			if (typeof products !== "undefined") {

				for (i = 0; i < products.length; i++) {

				if (products[i].product_Id === prodId) {

					//update order collection ,change product status 'rejected'
					await Order.updateOne(
					{ _id: orderId, "products.product_Id": prodId },
					{
						$set: {
						order_Status: "rejected_return_request",
						"products.$.status": "confirmed",
						},
					}
					);

				 return	res.send({ message: "updated successfully ", success: true });
					//break;
				}
			  }
			}
		}
	} catch (error) {
			return res.status(500).send("Server Error");
		}
};

//Exports
module.exports = {

	//admin
  loadOrderList,
  loadOrderDetails,

//   loadOrderStatus,
  updateOrderStatus,
  loadmyOrders,

  // loadOrderDetails,

  cancelMyOrder,

  sendReturnRequest,

  loadAdminOrderDetails,

  acceptReturnRequest,
  rejectReturnRequest

};
