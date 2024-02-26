const express=require('express');
const wishlist_route=express();
//session
const session=require('express-session');
const config=require("../config/config");


wishlist_route.use(session({secret:config.sessionSecret,
    resave:true, saveUninitialized: true}))

//cartController controller
const wishlistController=require('../controllers/wishlistController');

//cartController controller
const cartController=require('../controllers/cartController');

//middleware
const auth=require("../middleware/auth")

//view engine
wishlist_route.set('view engine','ejs');
wishlist_route.set('views','./views/wishlist');

//body parser
const bodyparser=require('body-parser');
wishlist_route.use(bodyparser.json());
wishlist_route.use(bodyparser.urlencoded({extended:true}));


//load wishlist
wishlist_route.get('/wishlist',auth.isLogin,wishlistController.loadWishlist);

//add to wishlist
wishlist_route.post('/add_To_Wishlist/:id',auth.isLogin,wishlistController.add_To_Wishlist);

//decriment item qty
wishlist_route.post('/decriment/:id',auth.isLogin,wishlistController.decrimentItemQuantity);

//remove  item 
// wishlist_route.post('/removeItem/:id',auth.isLogin,wishlistController.removeItem);

//clear cart
wishlist_route.get('/clearWishlist',auth.isLogin,wishlistController.clearWishlist);


//add to cart
wishlist_route.get('/add_To_Cart/:id',auth.isLogin,wishlistController.add_To_Cart);

//Exports
module.exports=wishlist_route 