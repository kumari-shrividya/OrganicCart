const express=require('express');
const cart_route=express();
//session
const session=require('express-session');
const config=require("../config/config");


cart_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}))

//cartController controller
const cartController=require('../controllers/cartController');

//session

//view engine
cart_route.set('view engine','ejs');
cart_route.set('views','./views/cart');

//body parser
const bodyparser=require('body-parser');
cart_route.use(bodyparser.json());
cart_route.use(bodyparser.urlencoded({extended:true}));

//add to cart
cart_route.get('/add_To_Cart/:id',cartController.add_To_Cart);
//load checkout
cart_route.get('/checkout',cartController.loadCheckout);
//update cart
cart_route.get('/updateCart/:id',cartController.updateCart);
//clear cart
cart_route.get('/clearCart',cartController.clearCart);
//place order
//cart_route.get('/placeOrder',cartController.placeOrder);

//load  order Summary while clicking buy now ->checkout & select payment method
cart_route.get('/orderSummary',cartController.loadOrderSummary);

//apply promo code
cart_route.post('/apply_promoCode',cartController.applyPromoCode);

//select billing address from the list checkout page
cart_route.get('/selectBillingAddress/:id',cartController.getBillingAddress);



//place order
//cart_route.get('/placeOrder',cartController.placeOrder);

//load select payment method
cart_route.post('/payment',cartController.loadPayment);
//place order
cart_route.post('/placeOrder',cartController.placeOrder); 
//online payment
cart_route.post('/onlinePayment',cartController.onlinePayment); 
//online payment success
cart_route.get('/orderSuccess',cartController.loadOrderSuccess); 
//load get invoice
cart_route.get('/getInvoice',cartController.loadGetInvoice); 

//Exports
module.exports=cart_route 