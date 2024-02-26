const Category = require('../models/categoryModel');
const product = require('../models/productModel');
const User = require('../models/userModel');
const Order = require("../models/orderModel");

const multer=require('multer');
const sharp=require('sharp');
const multerStorage=multer.memoryStorage();

const puppeteer=require('puppeteer');
const path=require('path');
const exceljs=require('exceljs');

//multer
const {uploadImages,resizeImages}=require('../util/imageUpload');
const {uploadImage,resizeImage}=require('../util/CategoryMulter')

//load admin home page
const loadAdminHome=async(req,res)=>{
    try{    
        res.render('adminHome'); 
      }catch(error){
      return res.status(500).send("Server Error");
    }
}


//render admin login
const loadBlog=async(req,res)=>{
  try{

    if(req.session.user_id){

      const userData = await User.findOne({ _id: req.session.user_id });

      return res.render("blog", {
        user: userData,
        cart: req.session.cart,
        wishlist: req.session.wishlist,
      });
     
    }
    else{
     return res.render('blog');  
    }
        
  }catch(error){
    return res.status(500).send("Server Error");
  }
}
//render admin login
const loadAdminLogin=async(req,res)=>{
    try{
      res.render('login');  
         
    }catch(error){
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
      return res.status(500).send("Server Error");
    }
}

// veryfy admin login
const verifyAdminLogin=async(req,res)=>{
     try {
            var email = req.body.email;
            var password = req.body.password;
             if(process.env.ADMIN==email && process.env.ADMINPASS==password){   
                 req.session.admin=true;
                 res.redirect('/admin/dashboard');          
               }
            else{
                res.render('login',{message:"Invalid credentials!"});
                }

        }catch(error){
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
			let currentData = users.slice(startindex,endindex);
			
			res.render('userList',{users:currentData,totalpages,currentpage});
		}
	}catch(error){
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
		return res.status(500).send("Server Error");
	}
}

//load user Details
const loadUserDetails=async(req,res)=>{
  try{
		const userid=req.params.id;
		const userData=await User.find({'_id':userid});   
		if(Array.isArray(userData[0].cart_Data) && userData[0].cart_Data.length>0){       
			res.render('userDetails',{cart:userData[0].cart_Data});
		}
		else {
			res.render('userDetails',{cart:[]});
		}
	}catch(error){
		return res.status(500).send("Server Error");	
	}
}

// block user
const blockUser=async(req,res)=>{
		const id=(req.params.id);
	try{
		 await User.findOneAndUpdate({'_id':id},{$set:{"is_blocked": 1}});
		 const users=await User.find();
		if(users){
      const itemsperpage = 8;
			const currentpage = parseInt(req.query.page) || 1;
			const startindex = (currentpage - 1) * itemsperpage;
			const endindex = startindex + itemsperpage;
			const totalpages = Math.ceil(users.length / 8)
			let currentData = users.slice(startindex,endindex);
			return res.render('userList',{users:currentData,totalpages,currentpage});
		}
	}catch(error){
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
      const itemsperpage = 8;
			const currentpage = parseInt(req.query.page) || 1;
			const startindex = (currentpage - 1) * itemsperpage;
			const endindex = startindex + itemsperpage;
			const totalpages = Math.ceil(users.length / 8)
			let currentData = users.slice(startindex,endindex);
			return res.render('userList',{users:currentData,totalpages,currentpage});
		}
	}catch(error){
		return res.status(500).send("Server Error");
	}
}

//render add category
const loadCategory=async(req,res)=>{
    try{
        res.render('category',{errors:'',data:''});
	 }catch(error){
      return res.status(500).send("Server Error");
    }
 }

//add new category
const addCategory = async (req, res) => {
    try {
         const category = Category({
         category: req.body.title,
         offer_Percentage: req.body.offer,
         image:req.session.fileName,
         unlisted:0
         });

         const catData = await category.save();

        if(catData){
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
         return  res.send('Category must be unique');
        }
		else{
		return res.status(500).send("Server Error");
		}
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
              const itemsperpage = 8;
              const currentpage = parseInt(req.query.page) || 1;
              const startindex = (currentpage - 1) * itemsperpage;
              const endindex = startindex + itemsperpage;
              const totalpages = Math.ceil(categories.length / 8);
              let currentcategories = categories.slice(startindex,endindex);
            return  res.render('categoryList',{categories:currentcategories,totalpages,currentpage});
            //  res.render('categoryList',{categories});
             }
    }catch(error){
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
              const itemsperpage = 8;
              const currentpage = parseInt(req.query.page) || 1;
              const startindex = (currentpage - 1) * itemsperpage;
              const endindex = startindex + itemsperpage;
              const totalpages = Math.ceil(categories.length / 8);
              let currentcategories = categories.slice(startindex,endindex);
              res.render('categoryList',{categories:currentcategories,totalpages,currentpage});
            // res.render('categoryList',{categories});
            }
        }catch(error){
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
          return res.status(500).send("Server Error");
        }
}

//load edit product
const loadEditProduct=async(req,res)=>{
        const id=req.params._id;
    try{
            const categories=await Category.find({});
            const products=await product.find({_id:id})
            .populate('category_id');
            req.session.product=products;
        
        if(products){
           res.render('editProduct',{categories:categories,products:products,errors:'',data:''});
        }
         }catch(error){
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

				const uploadFile= uploadcat.single('image');
				uploadFile;
				resizeImage;
				const  image=req.session.fileName;
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
            const result=await Category.find({"category":req.body.title.toLowerCase()});
             if(result){
             return  res.render('editCategory',{categories:result,errors:'',data:'',message:'Category must be unique!'});
            }            
            }
            else{
             console.log(error.message)
            }
        }
   }

// edit product
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
              const itemsperpage = 6;
              const currentpage = parseInt(req.query.page) || 1;
              const startindex = (currentpage - 1) * itemsperpage;
              const endindex = startindex + itemsperpage;
              const totalpages = Math.ceil(products.length / 6);
              let currentData = products.slice(startindex,endindex);
            res.render('productList',{products:currentData,isEditted:true,totalpages,currentpage});
            }
        }catch(error){
             return res.status(500).send("Server Error");
        }
    }

//edit product image
const editProductImage=async(req,res)=>{
      try{
        const id=(req.params.id);
          const ProdImages=await product.updateOne({_id:id},{$set:{images:req.body.image}});
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
         await product.findOneAndUpdate({'_id':id},{$set:{"unlisted": 1}});

         const products=await product.find();
        if(products){
          const itemsperpage = 6;
          const currentpage = parseInt(req.query.page) || 1;
          const startindex = (currentpage - 1) * itemsperpage;
          const endindex = startindex + itemsperpage;
          const totalpages = Math.ceil(products.length / 6);
          let currentproducts = products.slice(startindex,endindex);

         return  res.render('productList',{products:currentproducts,totalpages,currentpage});
        //  res.render('productList',{products});
         }
    }catch(error){
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.send('Product Name must be unique');
     }
	 else{
		return res.status(500).send("Server Error");
	 }
    
    }
 }

//delist  product
const listProduct=async(req,res)=>{
         const id=(req.params.id);
     try{
        await product.findOneAndUpdate({'_id':id},{$set:{"unlisted": 0}});
        const products=await product.find();

        if(products){
          const itemsperpage = 6;
          const currentpage = parseInt(req.query.page) || 1;
          const startindex = (currentpage - 1) * itemsperpage;
          const endindex = startindex + itemsperpage;
          const totalpages = Math.ceil(products.length / 6);
          let currentproducts = products.slice(startindex,endindex);

         return  res.render('productList',{products:currentproducts,totalpages,currentpage});
        //  res.render('productList',{products});
         }
    }catch(error){
   return res.status(500).send("Server Error");           }
   }

// add new product
const addProduct = async (req, res) => { 
     try{
            const Product = product({
                title: req.body.title,
                description: req.body.description,
                category_id: req.body.categoryId,
                unit_price: req.body.unit_price,
                Weight: req.body.weight,
                quantity: req.body.quantity,
                images:req.body.image,
                unlisted:0

            });

            const prodData= await Product.save();

            if(prodData){         
                const products=await product.find();

                if(products){
                  const categories=await Category.find({});
                  const previewImages = req.files.map(file => file.buffer.toString('base64'));
                  res.status(201).render('product', { previewImages,message:'' ,errors:'',data:'',
				  categories:categories,isAdded:true});
                }
            }
        }catch(error){
            if (error.name === 'MongoServerError' && error.code === 11000) {
             return  res.send('Product Name must be unique');
              }
			  else{
				return res.status(500).send("Server Error");
			  }
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
		return res.status(500).send("Server Error");
	}
}

// productwise total sales 
const totalSales=async(req,res)=>{

        const rpt_Type=req.body["rpt_type"];
        const isappliedFilter=req.body["chkProduct"];
        const productId=req.body.productId;
        const rpt_Date1=req.body.report_Date1;
        const rpt_Date2=req.body.report_Date2;
          
        const d=new Date(rpt_Date1);
        const year=d.getFullYear();
        const month=d.getMonth();
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

			 }
			 else{
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

			if(result){						
			return   res.render('salesReportTable',{result:result,rpt_Date1,rpt_Date2,message:message});		
			}
				
	}catch(error){
	return  res.status(500).json({ message: 'Internal Server Error' });
	}
}

//======================================== remove  fom here to ===================================
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
    const data = await workBook.xlsx.writeFile(`public/ExcelRpt/${filename}`);

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

//============================================= remove up to here ============

//load coupon
const loadCoupon=async(req,res)=>{
  try{

   res.render('coupon');

  }catch(error){
    return res.status(500).send("Server Error");
  }
}


//load dashboard
const loadAdminDashboard=async(req,res)=>{
  try {
		const products = await product.find();
		const orders = await Order.find({});
		const catogary=await Category.find()
		const users= await User.find()

		const latestOrders = await Order.find( {order_Status:"Delivered"}).sort({ order_Date: -1 }).limit(5);
	
		const productCount = products.length;
		const orderCount = orders.length;
		const catogaryCount=catogary.length
	
   		const totalRevenue = orders.reduce((total, order) => total + order.total_Amount, 0);

        return res.render('dashboard', { totalRevenue, orderCount, productCount,catogaryCount ,latestOrders});
    }
    catch (error) {
        console.log('Error happened in admin controller at adminLoginPage function ', error);
    }
}


// chart js
const getChartData=async(req,res)=>{

   // -------------------this is for graph dashboard-----
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
        }
		   
	  res.json(chartData);
}

//about us
const loadAboutus=async(req,res)=>{

	try{

	if(req.session.user_id){

		const userData = await User.findOne({ _id: req.session.user_id });
  
		return res.render("AboutUs", {
		  user: userData,
		  cart: req.session.cart,
		  wishlist: req.session.wishlist,
		});
	   
	  }
	  else{
	   return res.render('AboutUs');  
	  }
	}catch(error){
		return res.status(500).send(error.message)
	}
 
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
    exportToExcel,

    loadBlog

}