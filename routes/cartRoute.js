const express=require('express');
const cart_route=express();
//session
const session=require('express-session');
const config=require("../config/config");
const cors = require('cors');

cart_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}))

//cartController controller
const cartController=require('../controllers/cartController');

//session

cart_route.use(cors({origin:"*",
methods:["GET","POST","PUT"]

}));

// cart_route.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,Content-Type, Accept");
//     next();
// });

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
// cart_route.get('/checkout',cartController.loadCheckout);

cart_route.get('/myCart',cartController.loadCart)

// //update cart
// cart_route.get('/updateCart/:id',cartController.updateCart);


//incriment cart quantity
cart_route.post('/incriment/:id',cartController.incrimentItemQuantity);

//decriment cart quantity
cart_route.post('/decriment/:id',cartController.decrimentItemQuantity);

//remove an item from cart
cart_route.post('/removeItem/:id',cartController.removeCartItem);


//clear cart
cart_route.get('/clearCart',cartController.clearCart);
//place order
//cart_route.get('/placeOrder',cartController.placeOrder);

//load  order Summary while clicking buy now ->checkout & select payment method
cart_route.get('/orderSummary',cartController.loadOrderSummary);

//apply promo code
// cart_route.post('/apply_promoCode',cartController.applyPromoCode);
cart_route.post('/apply_promoCode/:id',cartController.applyCoupon);

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