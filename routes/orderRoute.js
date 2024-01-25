const express=require('express');
const order_route=express();
//session
const session=require('express-session');
const config=require("../config/config");


order_route.use(session({secret:config.sessionSecret,resave:true, saveUninitialized: true}))

//middleware for auth
//const adminAuth=require('../middleware/adminAuth');

//orderController controller
const orderController=require('../controllers/orderController');


//session

//view engine
order_route.set('view engine','ejs');
order_route.set('views','./views/order');

//body parser
const bodyparser=require('body-parser');
order_route.use(bodyparser.json());
order_route.use(bodyparser.urlencoded({extended:true}));

//load order list
order_route.get('/orders',orderController.loadOrderList);

//update Order Status
//order_route.get('/updateOrderStatus/:id',orderController.loadOrderStatus);

// update order status
order_route.post('/updateOrderStatus/:id',orderController.updateOrderStatus);

//load my orders
order_route.get('/myOrders',orderController.loadmyOrders);

//load order details
order_route.get('/orderDetails/:id',orderController.loadOrderDetails);

//cancel my Order
order_route.get('/cancelMyOrder/:id',orderController.cancelMyOrder);

//send return request to a product  ordered
order_route.get('/sendReturnRequest/:id',orderController.sendReturnRequest);

// order details for admin
order_route.get('/adminOrderDetails/:id',orderController.loadAdminOrderDetails);

//accept Return Request
order_route.get('/acceptReturnRequest/:id',orderController.acceptReturnRequest);

//rejet Return Request
order_route.get('/rejectReturnRequest/:id',orderController.rejectReturnRequest);


order_route.get('/sales',orderController.sales);




//Exports
module.exports=order_route 