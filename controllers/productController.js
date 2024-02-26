
const Category = require("../models/categoryModel");
const product = require("../models/productModel");
const User = require("../models/userModel");

//var ObjectId = require('mongodb').ObjectID;
const { ObjectId } = require("mongodb").ObjectId;


//get product details
const getProductDetails = async (req, res) => {
		try {
			const userData = await User.findOne({ _id: req.session.user_id });
			const Product = await product.findOne({ _id: req.params.id });
		if (Product) {

			if(req.session.user_id){
				return res.render("details", {
					Product,
					user: userData,
					cart: req.session.cart,
					wishlist:req.session.wishlist
				});
			}
			else{
				return res.render("details", {
					Product
					
				});
			}
			

		}
		} catch (error) {
			return res.status(500).send("Server Error");
		}
};

//user product list
const getAllProducts = async (req, res) => {

		try {
				const userData = await User.findOne({ _id: req.session.user_id });
				let search = "";

				let page = 1;
				const limit = 8;
				search = req.body.search;

		    if (search) {
			    const products = await product
				.find({
				unlisted: 0,
				$or: [
					{ title: { $regex: ".*" + search + ".*", $options: "i" } },
					{ description: { $regex: ".*" + search + ".*", $options: "i" } },
				],
				})
				.sort({ title: -1 })
				.limit(limit * 1)
				.skip((page - 1) * limit)
				.exec();
			
			if (products) {
				const itemsperpage = 8;
				const currentpage = parseInt(req.query.page) || 1;
				const startindex = (currentpage - 1) * itemsperpage;
				const endindex = startindex + itemsperpage;
				const totalpages = Math.ceil(products.length /8);
				let currentproduct = products.slice(startindex, endindex);

				return res.render("user_Products_Search", {
				products: currentproduct,
				totalpages,
				currentpage,
				user: userData,
				cart: req.session.cart,
				wishlist: req.session.wishlist,
				});
			}
			
			} else {
				const itemsperpage = 3;
				const currentpage = parseInt(req.query.page) || 1;
				const startindex = (currentpage - 1) * itemsperpage;
				const endindex = startindex + itemsperpage;
				// const totalpages = Math.ceil(products.length / 3);
				const totalpages = 1;
			}
		} catch (error) {
			return res.status(500).send(error.message);
		}
};

//get categorywise product list
const getCategorywiseProductList = async (req, res) => {
		try {
			id = req.paramas.id;
			const products = await product.find({}).populate("category_id");

			let userData;
		if (req.session.user_id !== "undefined") {

			   userData = await User.findOne({ _id: req.session.user_id });

			if (userData?.cart_Data) {
				//  ?. optional chaining for checking null
				req.session.cart = userData.cart_Data;
			} else {
				req.session.cart = [];
			}

				if (userData?.wishlist_Data) {
					req.session.wishlist = userData.wishlist_Data;
				} else {
					req.session.wishlist = [];
				}
		} else {
				userData = "undefined";
				req.session.wishlist = "undefined";
				req.session.cart = "undefined";

			 if (products) {
				const itemsperpage = 3;
				const currentpage = parseInt(req.query.page) || 1;
				const startindex = (currentpage - 1) * itemsperpage;
				const endindex = startindex + itemsperpage;
				const totalpages = Math.ceil(products.length / 3);
				let currentproduct = products.slice(startindex, endindex);
				return res.render("user_Products_Search", {
				products: currentproduct,
				totalpages,
				currentpage,
				});
			}
		}

				if (products) {
				const itemsperpage = 3;
				const currentpage = parseInt(req.query.page) || 1;
				const startindex = (currentpage - 1) * itemsperpage;
				const endindex = startindex + itemsperpage;
				const totalpages = Math.ceil(products.length / 3);
				let currentproduct = products.slice(startindex, endindex);

			  res.render("user_Products_Search", {
				products: currentproduct,
				user: userData,
				cart: req.session.cart,
				wishlist: req.session.wishlist,
				totalpages,
				currentpage,
			});
			}
		} catch (error) {
			return res.status(500).send(error.message);
		}
};

//delete image
const deleteImage = async (req, res) => {
		try {
			const id = req.params.id;
			const imageId = req.query.imageId;
				const Product = await product.findOne({ _id: id });
			console.log(Product);
			if (!Product.images) {
			return res.status(404).json({ message: "Product not found" });
			}

				var imageIndex = Product.images.filter(function (item) {
			return item.indexOf(imageId);
			});
			// const imageIndex = Product.images.indexOf(imageId);

			if (imageIndex === -1) {
			return res
				.status(404)
				.json({ message: "Image not found for the specified product" });
			}

			// Remove the image from the array
			Product.images.splice(imageIndex, 1);

			// Save the updated product
			await Product.save();

			res.json({
			message: "Image deleted successfully",
			updatedProduct: Product,
			});

		} catch (error) {
			res.status(500).json({ message: "Internal Server Error" });
		}
};

//edit image
const editProductImage = async (req, res) => {
		try {
			await product.updateOne(
			{
				_id: req.params.id,
				images: req.params.id,
			},
			{ $push: { "images.$": req.session.prodFileName } }
			);

		} catch (error) {
			return res.status(500).send(error.message);
		}
};

//load user product list
const loadUserProductList = async (req, res) => {
		try {
			const products = await product.find().populate("category_id");
			let userData;
			if (req.session.user_id !== "undefined") {

			userData = await User.findOne({ _id: req.session.user_id });

			if (userData?.cart_Data) {
				//  ?. optional chaining for checking null
				req.session.cart = userData.cart_Data;
			} else {
				req.session.cart = [];
			}

			if (userData?.wishlist_Data) {
				req.session.wishlist = userData.wishlist_Data;
			} else {
				req.session.wishlist = [];
			}
			} else {
				userData = "undefined";
				req.session.wishlist = "undefined";
				req.session.cart = "undefined";

				if (products) {
					return res.render("user_Product_List", { products: products });
				}
			}

			if (products) {
			   res.render("user_Product_List", {
				products: products,
				user: userData,
				cart: req.session.cart,
				wishlist: req.session.wishlist,
			});

			}
		} catch (error) {
			return res.status(500).send(error.message);
		}
};


// load user product search
const loadUser_Product_Search = async (req, res) => {

		try {
			const products = await product.find().populate("category_id");

			let userData;
		if (req.session.user_id ) {

			userData = await User.findOne({ _id: req.session.user_id });

			if (userData?.cart_Data) {
				//  ?. optional chaining for checking null
				req.session.cart = userData.cart_Data;
			} else {
				req.session.cart = [];
			}

			if (userData?.wishlist_Data) {
				req.session.wishlist = userData.wishlist_Data;
			} else {
				req.session.wishlist = [];
			}

			if (products) {
				const itemsperpage = 8;
				const currentpage = parseInt(req.query.page) || 1;
				const startindex = (currentpage - 1) * itemsperpage;
				const endindex = startindex + itemsperpage;
				const totalpages = Math.ceil(products.length / 8);
				let currentproduct = products.slice(startindex, endindex);

			    res.render("user_Products_Search", {
				products: currentproduct,
				user: userData,
				cart: req.session.cart,
				wishlist: req.session.wishlist,
				totalpages,
				currentpage,
			   });
			}	

		} else {
			userData = "undefined";
			req.session.wishlist = "undefined";
			req.session.cart = "undefined";

			if (products) {
				const itemsperpage = 8;
				const currentpage = parseInt(req.query.page) || 1;
				const startindex = (currentpage - 1) * itemsperpage;
				const endindex = startindex + itemsperpage;
				const totalpages = Math.ceil(products.length / 8);
				let currentproduct = products.slice(startindex, endindex);

				return res.render("user_Products_Search", {

				products: currentproduct,
				totalpages,
				currentpage,

				});
			}
		}

		// 	if (products) {
		// 	const itemsperpage = 8;
		// 	const currentpage = parseInt(req.query.page) || 1;
		// 	const startindex = (currentpage - 1) * itemsperpage;
		// 	const endindex = startindex + itemsperpage;
		// 	const totalpages = Math.ceil(products.length / 8);
		// 	let currentproduct = products.slice(startindex, endindex);

		// 	res.render("user_Products_Search", {
		// 		products: currentproduct,
		// 		user: userData,
		// 		cart: req.session.cart,
		// 		wishlist: req.session.wishlist,
		// 		totalpages,
		// 		currentpage,
		// 	});

		// }

	} catch (error) {
		return res.status(500).send(error.message);
	}
};



//filter products by category
const filterProductsByCategory = async (req, res) => {

			try{
					// let page = 1;
					// const limit = 4;
					const userData = await User.findOne({ _id: req.session.user_id });
					//const filterCategory = [];
				
					let bodyData = [];
					let lowerArray = [];
					const selectedCategories = req.body.category;

			if(selectedCategories==="All"){

				product.find({unlisted:0})
					.then((products)=>{

					    if(products){

					        const itemsperpage = 4;
							const currentpage = parseInt(req.query.page) || 1;
							const startindex = (currentpage - 1) * itemsperpage;
							const endindex = startindex + itemsperpage;
							const totalpages = Math.ceil(products.length / 4);
							let currentproduct = products.slice(startindex, endindex);
					
							return res.render("user_Products_Search", {
								products: products,
								totalpages:1,
								currentpage:1,
								user: userData,
								cart: req.session.cart,
								wishlist: req.session.wishlist,
							});
						}
					})

			    }

					bodyData=selectedCategories;
					
				if (Array.isArray(selectedCategories) && selectedCategories.length) {

					//change category name to lowercase
					lowerArray = selectedCategories.map((c) => c.toLowerCase());
					} 
					else {
							
						if(typeof selectedCategories!=='undefined' ){
							lowerArray = selectedCategories.toLowerCase();
						}
						else{

							if(req.session.user_id){
								return res.render("user_Products_Search", {
								products: "",
								totalpages:1,
								currentpage:1,
								user: userData,
								cart: req.session.cart,
								wishlist: req.session.wishlist,
								});
							}
							else{

								
								return res.render("user_Products_Search", {
									products: "",
									totalpages:1,
									currentpage:1,
									
									});
								
							}
						}
						
					}
				
						// let limit=8
						// const page=1
					Category.find({ category: { $in: lowerArray } }) //find  categories that  match category name array
						.then((category) => {

						if (category) {

							let categoryId = category
							.filter((ct) => ct.unlisted == 0) //filter unlisted categories

							.map((c) => c._id); //then return only category id to array

							//use this ID to find products in this category
							product
							.find({ category_id: { $in: categoryId } }).sort({ title: -1 })
							
							// .limit(limit * 1)
							// .skip((page - 1) * limit)
							
							//find product with selected category id's array
							// .limit(limit * 1)
							// .skip((page - 1) * limit)
							.then((products) => {
							//  console.log(products);
							// Products=products
							const itemsperpage = 8;
							const currentpage = parseInt(req.query.page) || 1;
							const startindex = (currentpage - 1) * itemsperpage;
							const endindex = startindex + itemsperpage;
							const totalpages = Math.ceil(products.length / 8);
							let currentproduct = products.slice(startindex, endindex);

							if(req.session.user_id){

							return res.render("user_Products_Search", {
							products: currentproduct,
							totalpages,
							currentpage,
							user: userData,
							cart: req.session.cart,
							wishlist: req.session.wishlist,
							});

						}
						else{
							return res.render("user_Products_Search", {
								products: currentproduct,
								totalpages,
								currentpage,
								
								});
						}



							
							})
							.catch((error) => console.error(error));
						} else {
							if(req.session.user_id){
								return res.render("user_Products_Search", {

									products: "",
									totalpages,
									currentpage,
									user: userData,
									cart: req.session.cart,
									wishlist: req.session.wishlist,
		
									});


							}
							else{


								return res.render("user_Products_Search", {

									products: "",
									totalpages,
									currentpage,
									
		
									});

							}

							//console.log("Category not found");
							// return res.render("user_Products_Search", {

							// products: "",
							// totalpages,
							// currentpage,
							// user: userData,
							// cart: req.session.cart,
							// wishlist: req.session.wishlist,

							// });
						}
						})
						.catch((error) => console.error(error));


		}catch(error){
		return res.status(500).send(error.message)
		}
};

module.exports = {
  getAllProducts,
  getProductDetails,
  loadUserProductList,

  deleteImage,
  editProductImage,
  loadUser_Product_Search,
  
  //getCategorywiseProductList,
  filterProductsByCategory,
};
