const express=require('express');
const order_route=express();
//session
const session=require('express-session');
const config=require("../config/config");


order_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}))


//orderController controller
const orderController=require('../controllers/orderController');

//view engine
order_route.set('view engine','ejs');
order_route.set('views','./views/order');

//body parser
const bodyparser=require('body-parser');
order_route.use(bodyparser.json());
order_route.use(bodyparser.urlencoded({extended:true}));

//middleware user auth
const auth=require("../middleware/auth");

//admin auth
const adminAuth=require('../middleware/adminAuth');


//load order list for admin
order_route.get('/orders',adminAuth.isLogin,orderController.loadOrderList);

// update order status
order_route.post('/updateOrderStatus/:id',adminAuth.isLogin,orderController.updateOrderStatus);

//load my orders
order_route.get('/myOrders',auth.isLogin,orderController.loadmyOrders);

//load order details
order_route.get('/orderDetails/:id',auth.isLogin,orderController.loadOrderDetails);

//cancel my Order
order_route.get('/cancelMyOrder/:id',auth.isLogin,orderController.cancelMyOrder);

//send return request to a product  ordered
order_route.get('/sendReturnRequest/:id',auth.isLogin,orderController.sendReturnRequest);

// order details for admin
order_route.get('/adminOrderDetails/:id',adminAuth.isLogin,orderController.loadAdminOrderDetails);

//accept Return Request
order_route.get('/acceptReturnRequest/:id',adminAuth.isLogin,orderController.acceptReturnRequest);

//rejet Return Request
order_route.get('/rejectReturnRequest/:id',adminAuth.isLogin,orderController.rejectReturnRequest);

//Exports
module.exports=order_route 