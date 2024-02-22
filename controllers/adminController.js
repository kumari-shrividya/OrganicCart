const Category = require('../models/categoryModel');
const product = require('../models/productModel');
const User = require('../models/userModel');
const Order = require("../models/orderModel");

const multer=require('multer');
const sharp=require('sharp');
const multerStorage=multer.memoryStorage();

// const resizeImage=require('../util/resizeImage');
const puppeteer=require('puppeteer');
const path=require('path');
const exceljs=require('exceljs');

//multer
const {uploadImages,resizeImages}=require('../util/imageUpload');
// const{uploadImage,resizeImage}=require('../util/CategoryImageUpload')
const {uploadImage,resizeImage}=require('../util/CategoryMulter')
//for retrieving data  from admin collection (admin already existing in db)
// const mongoose=require('mongoose');
// const collection = mongoose.connection.collection('admin')

//load admin home page
const loadAdminHome=async(req,res)=>{
    try{    
        res.render('adminHome'); 
      }catch(error){
      console.log(error);
      return res.status(500).send("Server Error");
    }
}
//render admin login
const loadAdminLogin=async(req,res)=>{
    try{
    res.render('login');  
         
    }catch(error){
      console.log(error); 
      return res.status(500).send("Server Error");
    }
}
// admin logout
const adminLogout=async(req,res)=>{
    try{
       // req.session.destroy();
       delete req.session.admin;
        res.redirect('/admin/login')
    }catch(error){
      console.log(error) ;
      return res.status(500).send("Server Error");
    }
}
// veryfy admin login
const verifyAdminLogin=async(req,res)=>{
     try {
            var email = req.body.email;
            var password = req.body.password;
           // console.log(process.env.ADMIN);
           // console.log(email)
             if(process.env.ADMIN==email && process.env.ADMINPASS==password){
                
                 req.session.admin=true;
                 res.redirect('/admin/dashboard');
          //  res.render('adminHome');
               
              //   console.log(req.session.admin);
           
               }
            else{
                res.render('login',{message:"Invalid credentials!"});
                }

           } catch(error){
              console.log(error);
              return res.status(500).send("Server Error");
             }
}
//load users list
const loadUserList=async(req,res)=>{
    try{
        const users=await User.find({});
      if(users){
        const itemsperpage = 8;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(users.length / 8)
        let currentCoupon = users.slice(startindex,endindex);
        
        res.render('userList',{users:currentCoupon,totalpages,currentpage});
        }
     }catch(error){
      console.log(error)
      return res.status(500).send("Server Error");
    }
}

//load user Address
const loadUserAddress=async(req,res)=>{
  try{

    const userid=req.params.id;
    
      const userData=await User.find({'_id':userid});
            
    if(Array.isArray(userData[0].address) && userData[0].address.length>0){
        
          res.render('userAddress',{addressList:userData[0].address});
      }
      else {
        res.render('userAddress',{addressList:[]});
      }
   }catch(error){
    console.log(error)
    return res.status(500).send("Server Error");
  }
}
//load user Details
const loadUserDetails=async(req,res)=>{
  try{

    const userid=req.params.id;
    
      const userData=await User.find({'_id':userid});
       // console.log(userData[0].address);
     
    if(Array.isArray(userData[0].cart_Data) && userData[0].cart_Data.length>0){
        
          res.render('userDetails',{cart:userData[0].cart_Data});
        }
      else {
        res.render('userDetails',{cart:[]});
      }
   }catch(error){
    console.log(error)
    return res.status(500).send("Server Error");
    
  }
}

//code to block user
const blockUser=async(req,res)=>{
    const id=(req.params.id);
    try{

        await User.findOneAndUpdate({'_id':id},{$set:{"is_blocked": 1}});
        const users=await User.find();

        if(users){
        res.render('userList',{users});
        }

      }catch(error){
        console.log(error)
        return res.status(500).send("Server Error");
               }
}
//code to unblock user
const unblockUser=async(req,res)=>{
    const id=(req.params.id);
    try{

        await User.findOneAndUpdate({'_id':id},{$set:{"is_blocked": 0}});
        const users=await User.find();

        if(users){
        res.render('userList',{users});
        }

      }catch(error){
        console.log(error)
        return res.status(500).send("Server Error");
        }
}
//code to render add category
const loadCategory=async(req,res)=>{
    try{
        res.render('category',{errors:'',data:''});
       }catch(error){
        console.log(error)
        return res.status(500).send("Server Error");
     }
 }
//add new category
const addCategory = async (req, res) => {

    try {
      
       // console.log(req.session.fileName);
           const category = Category({
            category: req.body.title,
            offer_Percentage: req.body.offer,
            image:req.session.fileName,//req.file.filename,
            // image:req.body.image,
            unlisted:0
        });

        const catData = await category.save();
        if(catData){
            console.log("Category Added");
           // res.json({ success: true, message: 'Category saved successfully' });

            const categories=await Category.find({});
            const itemsperpage = 8;
            const currentpage = parseInt(req.query.page) || 1;
            const startindex = (currentpage - 1) * itemsperpage;
            const endindex = startindex + itemsperpage;
            const totalpages = Math.ceil(categories.length / 8);
            let currentcategories = categories.slice(startindex,endindex);

            if(categories){
                  res.render('categoryList',{categories:currentcategories,totalpages,currentpage}); 
              }
        }
    }catch(error){
        
        if (error.name === 'MongoServerError' && error.code === 11000) {
         res.send('Category must be unique');
        }
        console.log(error);
       // res.json({ success: false, message: 'Category saved successfully' });
    }
    }

   // load  Category List
   const loadCategoryList=async(req,res)=>{
    try{
        const categories=await Category.find({});
      if(categories){
        const itemsperpage = 8;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(categories.length / 8);
        let currentcategories = categories.slice(startindex,endindex);
           res.render('categoryList',{categories:currentcategories,totalpages,currentpage});
        }
     }catch(error){
      console.log(error)
      return res.status(500).send("Server Error");
    }
}
 //load edit category
    const loadEditCategory=async(req,res)=>{

         const id=req.params.id;
       try{
        const categories=await Category.find({_id:id});

        if(categories){
            res.render('editCategory',{categories,errors:'',data:''});
        }
     }catch(error){
       
      console.log(error)
      return res.status(500).send("Server Error");
                 }
    }
   //unlist category
   const deleteCategory=async(req,res)=>{

            const id=(req.params.id);
        try{
             await Category.findOneAndUpdate({'_id':id},{$set:{"unlisted": 1}});
            const categories=await Category.find();

             if(categories){
             res.render('categoryList',{categories});
             }
            }catch(error){
             console.log(error)
             return res.status(500).send("Server Error");
            }
    }

    //list  Category
    const listCategory=async(req,res)=>{
        const id=(req.params.id);
        try{
            await Category.findOneAndUpdate({'_id':id},{$set:{"unlisted": 0}});
            const categories=await Category.find();
    
            if(categories){
            res.render('categoryList',{categories});
            }
        }catch(error){
            console.log(error)
            return res.status(500).send("Server Error");
        }
    }

    // load product form
    const loadProduct=async(req,res)=>{
        try{
            const categories=await Category.find({});
            //console.log(categories[0]._id);
            if(categories){
                res.render('product',{categories,errors:'',data:''});
            }
         }catch(error){
          console.log(error)
          return res.status(500).send("Server Error");
        }
    }
    //load product list
    const loadProductList=async(req,res)=>{
        try{
             let page = 1;
            const limit = 6;  

            const products=await product.find({})
            .sort({ title: 1 })
            // .limit(limit * 1)
            // .skip((page - 1) * limit)
            // .exec();

          if(products){
           const itemsperpage = 6;
          const currentpage = parseInt(req.query.page) || 1;
          const startindex = (currentpage - 1) * itemsperpage;
          const endindex = startindex + itemsperpage;
          const totalpages = Math.ceil(products.length / 6);
          let currentproducts = products.slice(startindex,endindex);

               res.render('productList',{products:currentproducts,totalpages,currentpage});
            }
         }catch(error){
          console.log(error)
          return res.status(500).send("Server Error");
        }
    }
    //load edit product
    const loadEditProduct=async(req,res)=>{
        const id=req.params._id;
       // console.log(id)
        try{
            const categories=await Category.find({});
            const products=await product.find({_id:id})
            .populate('category_id');
            req.session.product=products;
        
            if(products){
              //  console.log(products);
                res.render('editProduct',{categories:categories,products:products,errors:'',data:''});
            }
         }catch(error){
          console.log(error)
          return res.status(500).send("Server Error");
        }
    }
    //Edit  Category
 const updateEditCategory=async(req,res)=>{

        
       try{
              
        const id=(req.params.id);
        const category= req.body.title.toLowerCase();
        const offer=req.body.offer;
       
        if(!req.file){
        await Category.findOneAndUpdate({'_id':id},{$set:{"category": category,offer_Percentage:offer }}); 
       }
       else{         
        const uploadcat=multer({
    
         storage:multerStorage,
        });
          const uploadFile= uploadcat.single('image')
          uploadFile
          resizeImage
          // const  image=req.body.image
          const  image=req.session.fileName
          await Category.findOneAndUpdate({'_id':id},{$set:{"category": category,"image":image, offer_Percentage:offer }}); 
       }             
             const categories=await Category.find();
               if(categories){
                const itemsperpage = 6;
                const currentpage = parseInt(req.query.page) || 1;
                const startindex = (currentpage - 1) * itemsperpage;
                const endindex = startindex + itemsperpage;
                const totalpages = Math.ceil(categories.length / 6);
                let currentData = categories.slice(startindex,endindex);
      

               res.render('categoryList',{categories:currentData,isEdit:true,totalpages,currentpage});      
               }
       }catch(error){
            if (error.name === 'MongoServerError' && error.code === 11000) {     
            //  return res.send('Category must be unique');
            const result=await Category.find({"category":req.body.title.toLowerCase()});
            // console.log(result)
              if(result){
             return  res.render('editCategory',{categories:result,errors:'',data:'',message:'Category must be unique!'});
              }

             
          }
               else{
               console.log(error.message)


            

               }
               }
   }

 //method to edit product
 const updateEditProduct=async(req,res)=>{

         const id=(req.params.id);
         const title= req.body.title;
         const description=req.body.description;
         const category_id= req.body.categoryId
         const unit_price= req.body.unit_price;
         const Weight= req.body.weight;
         const quantity= req.body.quantity;
        
        try{ 

            if(req.files.length==0){
                await product.findOneAndUpdate({'_id':id},{$set:{"title": title,
                "description":description,
                "category_id":category_id,
                "unit_price": unit_price,
                "Weight":Weight,
                "quantity":quantity
           
            }}, 
             );
          }
        else{
                uploadImages,resizeImages
                await product.findOneAndUpdate({'_id':id},{$set:{"title": title,
                "description":description,
                "category_id":category_id,
                "unit_price": unit_price,
                "Weight":Weight,
                "quantity":quantity,
                "images":req.body.image
                }}, 
              );
          
           }
               const products=await product.find();
                if(products){
                res.render('productList',{products,isEditted:true});
                }
        }catch(error){
                console.log(error)
                return res.status(500).send("Server Error");
                }
    }


  //edit product image
    const editProductImage=async(req,res)=>{
      try{
        const id=(req.params.id);
          const ProdImages=await product.updateOne({_id:id},{$set:{images:req.body.image}});
          //console.log(categories[0]._id);
          const categories=await Category.find();
            
          if(ProdImages){
              res.render('product',{categories,errors:'',data:''});
          }
       }catch(error){
        console.log(error)
        return res.status(500).send("Server Error");
      }
  }
    //delete/unlist  product
    const deleteProduct=async(req,res)=>{
        const id=(req.params.id);
        try{
            //updateOne
            await product.findOneAndUpdate({'_id':id},{$set:{"unlisted": 1}});
            const products=await product.find();

            if(products){
            res.render('productList',{products});
            }
        }catch(error){
            if (error.name === 'MongoServerError' && error.code === 11000) {
                res.send('Product Name must be unique');
               }
            console.log(error)
            return res.status(500).send("Server Error");
                   }
    }
  //delist  product
   const listProduct=async(req,res)=>{
         const id=(req.params.id);
       try{
        await product.findOneAndUpdate({'_id':id},{$set:{"unlisted": 0}});
        const products=await product.find();

            if(products){
            res.render('productList',{products});
            }
        }catch(error){
        console.log(error)
        return res.status(500).send("Server Error");
               }
   }
   // add new product
    const addProduct = async (req, res) => { 
       // const filenames=req.files.map(file => file.filename)
            try {
                const Product = product({
                title: req.body.title,
                description: req.body.description,
                category_id: req.body.categoryId,
                unit_price: req.body.unit_price,
                Weight: req.body.weight,
                quantity: req.body.quantity,
              //  images:filenames,
              images:req.body.image,
                unlisted:0

            });
            const prodData= await Product.save();
            if(prodData){
             
                const products=await product.find();

                if(products){
                  const categories=await Category.find({});
                  const previewImages = req.files.map(file => file.buffer.toString('base64'));
                
                  res.status(201).render('product', { previewImages,message:'' ,errors:'',data:'',categories:categories,isAdded:true});
             //   res.render('productList',{products}),;
                }
            }
        }catch(error){
            if (error.name === 'MongoServerError' && error.code === 11000) {
             return  res.send('Product Name must be unique');
              }
            console.log(error);
        return res.status(500).send("Server Error",);
        }
}  
  //load Sales report
  const loadSalesReport=async(req,res)=>{
   
     try{
      const products=await product.find({});
      if(products){
        res.render('salesReport',{message:'',products});
      }
    
     }catch(error){
      console.log(error)
      return res.status(500).send("Server Error");
    }
}
// // productwise total sales 
// const totalSales=async(req,res)=>{
    

//          const rpt_Type=req.body["rpt_type"];
//         const rpt_Date1=req.body.report_Date1;
//         const rpt_Date2=req.body.report_Date2;
       

//         const d=new Date(rpt_Date1);
//       //  console.log(rpt_Date1,rpt_Date2);
//         const year=d.getFullYear();
//         let month=d.getMonth();
//         let day=d.getDate()
//         console.log(month);

//         const monthNames = ["January", "February", "March", "April", "May", "June",
//         "July", "August", "September", "October", "November", "December"
//       ];

//         let monthName=monthNames[month]
       

//        // console.log(month);
//      let  result,message='';

// try{
   
//    if(rpt_Type=="Monthly"){
//     // message=`${year}-${month}-01  to  ${year}-${month+1}-01`
//     // order_Date: { $gte: new Date(`${year}-${month}-${day}`), $lte: new Date(`${year}-${month}-${endDay}`) },
//     // $gte: new Date(`${year}-${month+1}-01`), $lte: new Date(`${year}-${month}-31`)
//  month=month+1
//    let day=1
//  let endDay=31;
//     message= `${monthName} ${year}`
//     let sdate=`${year}-${month}-${day}`
//     let edate=`${year}-${month}-${endDay}`
//     console.log(sdate)
//     console.log(edate)
//     result=await Order.aggregate([
//     {
//       $match: {
//         $expr: {
//             $eq: [{ $month: "$order_Date" }, `${month+1}`]
//         }
//     }
//       },
//       { $unwind: "$products" },
//       {
//         $group: {
//           _id:   { $dateToString: { format: "%Y-%m-%d", date: "$order_Date" } },
//           totalSales: { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }},
//           totalOrders: { $sum: 1 }
         
//         },
//       },
     
//     ])
//     }
//     else if(rpt_Type=="Yearly" ){
        
//       message=` Year:${year}`
//         //==============
//         result=await Order.aggregate([
//             {
//                 $match: {
//                   order_Date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
//                 },
//               },
//               { $unwind: "$products" },
//               {
//                 $group: {
//                   _id: "$products.name",
//                   totalSales: { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }},
//                  totalQuantity: { $sum: '$products.quantity' }
                 
//                 },
//               },
//             ]);

//     }
//     else if(rpt_Type==="Daily"){

//       var today = new Date();

//       var start = new Date(rpt_Date1);
//      start.setHours(0,0,0,0);

//       var end = new Date(rpt_Date1);
//       end.setHours(23,59,59,999);

//       console.log(start);
//       console.log(end)


//       let starDate=new Date(rpt_Date1);
//       let endDate=new Date(rpt_Date2);
//       console.log(starDate)
//       console.log(endDate)


//       if(starDate>endDate){
//         return   res.render('salesReport',{message:' Start Date must be greater than End Date'});
//       }
//       // { $match: { "order_Date": { $gte: new Date(rpt_Date1)} } },
//    //productwise sales 
//    message='Daily'
//      result=await Order.aggregate([
//     { $match: { "order_Date": { $gte: starDate, $lt: endDate} } },
//     { $unwind: "$products" },
//     { $group: { _id: "$products.name", totalSales: 
//     { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }} ,  
//      totalQuantity: { $sum: '$products.quantity' }
//     }}
//     ])

//     }
//     else if(rpt_Type==="EndDate"){
     
//       if(rpt_Date1>rpt_Date2){
//         return   res.render('salesReport',{message:' Ending Date shold be greater than Starting Date'});
//       }
//           message=`Report between Dates ${rpt_Date1} and ${rpt_Date2}`
//           result=await Order.aggregate([
//             {
//                 $match: {
//                   order_Date: { $gte: new Date(rpt_Date1), $lte: new Date(rpt_Date2) },
//                 },
//               },
//               { $unwind: "$products" },
//               {
//                 $group: {
//                   _id: "$products.name",
//                   totalSales: { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }},
//                 totalQuantity: { $sum: '$products.quantity' }
                
//                 },
//               },
//              ]);

//         }
//     else{
//       message='No Data available'
//   //  return res.send("No Data available");
//   res.render('salesReportTable',{rpt_Date1,rpt_Date2,message});
//  }
//  // if data available generate pdf
//         if(result){
         
          
//           console.log(result);
        
          
//           res.render('salesReportTable',{result,rpt_Date1,rpt_Date2,message:message});
//         //  exportToExcel(result,req,res);

//   //       if (result.length === 0) {
//   //           return res.status(404).json({ message: 'No sales data found' });
//   //         }
//   // // Call a function to generate PDF using Puppeteer
//   //         const pdfBuffer = await generatePDF(result,rpt_Date1);
//   //         res.contentType('application/pdf');
//   //      return res.send(pdfBuffer);
//     }
// }catch(error){
//     console.log(error);
//   return  res.status(500).json({ message: 'Internal Server Error' });
// }
// }


// productwise total sales 
const totalSales=async(req,res)=>{


        const rpt_Type=req.body["rpt_type"];
        const isappliedFilter=req.body["chkProduct"];
        const productId=req.body.productId;
        const rpt_Date1=req.body.report_Date1;
        const rpt_Date2=req.body.report_Date2;

           
        const d=new Date(rpt_Date1);
      //  console.log(rpt_Date1,rpt_Date2);
        const year=d.getFullYear();
        const month=d.getMonth();
       // console.log(month);
     let  result,message='';

try{
   
   if(rpt_Type=="Monthly"){
    message='Monthly Report'

    if(isappliedFilter && productId!='' && productId!='undefined'){
    result=await Order.aggregate([
    {
        $match: {
          order_Date: { $gte: new Date(`${year}-${month}-01`), $lte: new Date(`${year}-${month+1}-01`) },
        },
      },
      { $unwind: "$products" },
      { $match: { "products.product_Id": productId } },
      {
        $group: {
          _id: "$products.name",
          totalSales: { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }},
         totalQuantity: { $sum: '$products.quantity' }
         
        },
      },
     
    ])
  }
  else{
    result=await Order.aggregate([
      {
          $match: {
            order_Date: { $gte: new Date(`${year}-${month}-01`), $lte: new Date(`${year}-${month+1}-01`) },
          },
        },
        { $unwind: "$products" },
        
        {
          $group: {
            _id: "$products.name",
            totalSales: { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }},
           totalQuantity: { $sum: '$products.quantity' }
           
          },
        },
       
      ])
  }
    }
    else if(rpt_Type=="Yearly" ){
        
      message='Yearly Report'
        //==============

          if(isappliedFilter && productId!='' && productId!='undefined'){
       
           result=await Order.aggregate([
            {
                $match: {
                  order_Date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
                },
              },
              { $unwind: "$products" },
              { $match: { "products.product_Id": productId } },
              {
                $group: {
                  _id: "$products.name",
                  totalSales: { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }},
                 totalQuantity: { $sum: '$products.quantity' }
                 
                },
              },
            ]);


          }else{
            result=await Order.aggregate([
              {
                  $match: {
                    order_Date: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) },
                  },
                },
                { $unwind: "$products" },
           
                {
                  $group: {
                    _id: "$products.name",
                    totalSales: { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }},
                   totalQuantity: { $sum: '$products.quantity' }
                   
                  },
                },
              ]);

          }
           
    }
    else if(rpt_Type==="Daily"){


   //productwise sales 
   message='Daily '

   if(isappliedFilter){
     result=await Order.aggregate([
    { $match: { "order_Date": { $gte: new Date(rpt_Date1)} } },
    { $unwind: "$products" },
    { $group: { _id: "$products.name", totalSales: 
    { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }} ,  
     totalQuantity: { $sum: '$products.quantity' }
    }}
    ])
  }
  else{
    result=await Order.aggregate([
      { $match: { "order_Date": { $gte: new Date(rpt_Date1)} } },
      { $unwind: "$products" },
      { $group: { _id: "$products.name", totalSales: 
      { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }} ,  
       totalQuantity: { $sum: '$products.quantity' }
      }}
      ])

  }
    }
    else if(rpt_Type==="EndDate"){

      // today=new Date();
      // if(rpt_Date2===null){
      //   return  res.render('salesReport',{message:' Please select End Date'});
      // }
      // if(rpt_Date1>rpt_Date2){

      //   return  res.render('salesReport',{message:' End Date must be greater than Start Date'});
      // }
      message='Report between Dates'
      if(isappliedFilter && productId!='' && productId!='undefined'){

        result=await Order.aggregate([
          {
              $match: {
                order_Date: { $gte: new Date(rpt_Date1), $lte: new Date(rpt_Date2) },
              },
            },
            { $unwind: "$products" },
            { $match: { "products.product_Id": productId } },
            {
              $group: {
                _id: "$products.name",
               totalSales: { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }},
               totalQuantity: { $sum: '$products.quantity' }
               
              },
            },
          ]);
        
      }
      else{

 
      result=await Order.aggregate([
        {
            $match: {
              order_Date: { $gte: new Date(rpt_Date1), $lte: new Date(rpt_Date2) },
            },
          },
          { $unwind: "$products" },
          {
            $group: {
              _id: "$products.name",
              totalSales: { $sum: { $multiply: [ "$products.price", "$products.quantity" ] }},
             totalQuantity: { $sum: '$products.quantity' }
             
            },
          },
        ]);
      }
    }
 else{
  return  res.render('salesReport',{message:'Please select a report type.'});
 }
 // if data available generate pdf
        if(result){
         
        //   const itemsperpage = 8;
        // const currentpage = parseInt(req.query.page) || 1;
        // const startindex = (currentpage - 1) * itemsperpage;
        // const endindex = startindex + itemsperpage;
        // const totalpages = Math.ceil(result.length / 8);
        // let currentData = result.slice(startindex,endindex);
          // console.log(result);
        
          
       return   res.render('salesReportTable',{result:result,rpt_Date1,rpt_Date2,message:message});
        //  exportToExcel(result,req,res);

  //       if (result.length === 0) {
  //           return res.status(404).json({ message: 'No sales data found' });
  //         }
  // // Call a function to generate PDF using Puppeteer
  //         const pdfBuffer = await generatePDF(result,rpt_Date1);
  //         res.contentType('application/pdf');
  //      return res.send(pdfBuffer);
    }
    // {
    //  return res.render('salesReport',{result,rpt_Date1,rpt_Date2,message:'No Data Available'});

    // }
}catch(error){
    console.log(error);
  return  res.status(500).json({ message: 'Internal Server Error' });
}
}



//function to generate pdf
 generatePDF=async(result,rpt_Date1)=>{
   // const browser=await puppeteer.launch({headless: false, args: ['--disable-features=site-per-process']});
   const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
   
    const page=await browser.newPage();
//display report using html
  const tableHtml = `
  <section style="background-color: #eee; padding-top: 5px;" >
   
    <div class="container">
          <h2 style="text-align=center"> Total Sales   &nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;&nbsp;Date: &nbsp;&nbsp;${rpt_Date1}</h2>
          <table class="table mt-5 table-striped">
  
    <tr>
      <th>Product</th>
       <th>&nbsp;&nbsp;TotalSales&nbsp;&nbsp;</th>
      <th>&nbsp;&nbsp;TotalQuantity</th>
    </tr>
    ${result.map(sale => `
      <tr>
        <td scope="col">${sale._id}</td>
        <td scope="col">&nbsp;Rs.&nbsp;${sale.totalSales}&nbsp;.00&nbsp;</td>
        <td scope="col">&nbsp;&nbsp;&nbsp;&nbsp;${sale.totalQuantity}</td>
             </tr>`).join('')}
    </table>
</div>
</section>
`;
await page.setViewport({width:1680,height:1050});

// Set content on the page
await page.setContent(tableHtml);

// Generate PDF
  let today=new Date();
    today=today.getTime();

const pdfBuffer = await page.pdf({path: `${path.join(__dirname,'../public/SalesReport',today+".pdf")}`, format: 'A4' });
new Promise(r => setTimeout(r, 15000));

await browser.close();

return pdfBuffer;

}
//export to excel
const exportToExcel=async (result,req,res)=>{
    try{
 const sales=result;
 //console.log(sales);
    const workBook =new exceljs.Workbook();
    const workSheet= workBook.addWorksheet("Sales Report");

        workSheet.columns=[
      // {header:"Sl.no",key:result.s_no},
      {header:"Title",key:"_id"},
      {header:"TotalSales",key:"totalSales"},
      {header:"Total Quantity",key:"totalQuantity"},
    ]

  let counter=1;

  sales.forEach((item)=>{
    // item.slno=counter;
    workSheet.addRow(item);
   //  counter++;
    });

    workSheet.getRow(1).eachCell((cell)=>{
      cell.font={bold:true}
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreasheetml.sheet"
    )
   
    let today=Date.now();
    let filename=today+"TotalSales.xlsx";
    const data = await workBook.xlsx.writeFile(`public/ExcelRpt/${filename}`)
    res.send({
      status: "success",
      message: "file successfully downloaded",
      path: `/public/ExcelRpt/TotalSales.xlsx`,
     });
 
} catch (err) {
  console.log(err);
//    res.send({
//    status: "error",
//    message: "Something went wrong",
//  });
return res.status(500).send("Server Error");
}
}

//load coupon
const loadCoupon=async(req,res)=>{
  try{
    
   //res.redirect('/admin/coupon')
   res.render('coupon')
  }catch(error){
    console.log(error) ;
    return res.status(500).send("Server Error");
  }
}


//load dashboard

const loadAdminDashboard=async(req,res)=>{
  try {
    const products = await product.find();
    // const orders = await Order.find({order_Status:"Delivered"});
    const orders = await Order.find({});
    const catogary=await Category.find()
    const users= await User.find()

   const latestOrders = await Order.find( {order_Status:"Delivered"}).sort({ order_Date: -1 }).limit(5);
 
    // console.log(latestOrders);
   
    const productCount = products.length;
    const orderCount = orders.length;
    const catogaryCount=catogary.length
  
    const totalRevenue = orders.reduce((total, order) => total + order.total_Amount, 0);

      return res.render('dashboard', { totalRevenue, orderCount, productCount,catogaryCount ,latestOrders});
   // res.json(chartData);
    }
    catch (error) {
        console.log('Error happened in admin controller at adminLoginPage function ', error);
    }
}

const getChartData=async(req,res)=>{

   // -------------------this is for the sales graph -----
   const monthlySales = await Order.aggregate([
    {
        $match: {
          order_Status: "Delivered", // Filter by status
        },
    }, 
    {
        $group: {
            _id: {
                $month: '$order_Date',
            },
            count: { $sum: 1 },
        },
    },
    {
        $sort: {
            '_id': 1,
        },
    },
]);


const monthlySalesArray = Array.from({ length: 12 }, (_, index) => {
    const monthData = monthlySales.find((item) => item._id === index + 1)
    return monthData ? monthData.count : 0;
});

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
        label: 'Orders Delivered',
        data: monthlySalesArray,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
    }]
};

res.json(chartData);
}

//
const loadAboutus=(req,res)=>{

 
    res.render('AboutUs');
 
}

//exports
module.exports = {
  //category
    loadCategory,
    addCategory,
    loadCategoryList,
    loadEditCategory,
    updateEditCategory,
    deleteCategory,
    listCategory,



//admin login
    verifyAdminLogin,
    loadAdminLogin,
    adminLogout,
    loadAdminHome,
    loadAdminDashboard,
    getChartData,
    loadAboutus,
    

  //coupon 
   loadCoupon,

    //user
    loadUserList,
    loadUserAddress,
    loadUserDetails,
    blockUser,
    unblockUser,

    //product
    loadProduct,
    addProduct,
    loadProductList,
    loadEditProduct,
    updateEditProduct,
    editProductImage,
    deleteProduct,
    listProduct,

    //report
    loadSalesReport,
    totalSales,
    exportToExcel

}