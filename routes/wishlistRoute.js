const express=require('express');
const wishlist_route=express();
//session
const session=require('express-session');
const config=require("../config/config");


wishlist_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}))

//cartController controller
const wishlistController=require('../controllers/wishlistController');

//cartController controller
const cartController=require('../controllers/cartController');

//session

//view engine
wishlist_route.set('view engine','ejs');
wishlist_route.set('views','./views/wishlist');

//body parser
const bodyparser=require('body-parser');
wishlist_route.use(bodyparser.json());
wishlist_route.use(bodyparser.urlencoded({extended:true}));

//load wishlist
wishlist_route.get('/wishlist',wishlistController.loadWishlist);

//add to wishlist
wishlist_route.get('/add_To_Wishlist/:id',wishlistController.add_To_Wishlist);

// change wishlist data
wishlist_route.get('/updateWishlist/:id',wishlistController.updateWishlist);

//clear cart
wishlist_route.get('/clearWishlist',wishlistController.clearWishlist);


//add to cart
wishlist_route.get('/add_To_Cart/:id',wishlistController.add_To_Cart);

//Exports
module.exports=wishlist_route 