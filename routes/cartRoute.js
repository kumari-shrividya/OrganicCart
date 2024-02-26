const express=require('express');
const cart_route=express();

//session
const session=require('express-session');
const config=require("../config/config");
const cors = require('cors');

//session
cart_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}))

//cartController 
const cartController=require('../controllers/cartController');

//middleware
const auth=require("../middleware/auth")

//cors
cart_route.use(cors({origin:"*",
methods:["GET","POST","PUT"]
}));

//view engine
cart_route.set('view engine','ejs');
cart_route.set('views','./views/cart');

//body parser
const bodyparser=require('body-parser');
cart_route.use(bodyparser.json());
cart_route.use(bodyparser.urlencoded({extended:true}));

//add to cart
cart_route.get('/add_To_Cart/:id',auth.isLogin,cartController.add_To_Cart);

//load cart
cart_route.get('/myCart',auth.isLogin,cartController.loadCart)

//incriment cart quantity
cart_route.post('/incriment/:id',auth.isLogin,cartController.incrimentItemQuantity);

//decriment cart quantity
cart_route.post('/decriment/:id',auth.isLogin,cartController.decrimentItemQuantity);

//remove an item from cart
cart_route.post('/removeItem/:id',auth.isLogin,cartController.removeCartItem);

//clear cart
cart_route.get('/clearCart',auth.isLogin,cartController.clearCart);

//load  order Summary while clicking buy now ->checkout & select payment method
cart_route.get('/orderSummary',auth.isLogin,cartController.loadOrderSummary);

//apply promo code
cart_route.post('/apply_promoCode/:id',auth.isLogin,cartController.applyCoupon);

//select billing address from the list checkout page
cart_route.get('/selectBillingAddress/:id',auth.isLogin,cartController.getBillingAddress);

//load select payment method
cart_route.post('/payment',auth.isLogin,cartController.loadPayment);

//place order 
cart_route.post('/placeOrder',auth.isLogin,cartController.placeOrder); 

//online payment
cart_route.post('/onlinePayment',auth.isLogin,cartController.onlinePayment); 

//online payment success
cart_route.get('/orderSuccess',auth.isLogin,cartController.loadOrderSuccess); 

//load get invoice
cart_route.get('/getInvoice',auth.isLogin,cartController.loadGetInvoice); 

//Exports
module.exports=cart_route 