const Category = require('../models/categoryModel');
const product = require('../models/productModel');
const User = require('../models/userModel');
//var ObjectId = require('mongodb').ObjectID;
const { ObjectId } = require('mongodb').ObjectId;
//get product details by id
const getProductDetails=async(req,res)=>{
 try{ 
    const userData = await User.findOne({ _id: req.session.user_id });   
    const Product=await product.findOne({_id:req.params.id}); 
        if(Product){
            console.log(Product)
            res.render('details',{Product,user:userData,cart:req.session.cart });
        }
     }catch(error){
      console.log(error);
      return res.status(500).send("Server Error");
    }
}
//user product list
const getAllProducts = async (req, res) => {
    try {
      
        const userData = await User.findOne({ _id: req.session.user_id });        
        let search='';
        //    let page= req.query.page;
        //    console.log(page)
        let page= 1;
        // if(req.query.page){
        //     page=req.query.page;
        //    // console.log(page);
        // }
               const limit=3;
               search=req.body.search;    
              // console.log(search);

        if(search){
          
            //console.log(search)  ;
            const products = await product.find({
            unlisted:0,
            $or:[
                {title:{$regex:'.*'+search +'.*',$options:'i'}},
                {description:{$regex:'.*'+search+'.*',$options:'i'}}  
            ]
        
        }).sort({title:-1})
        .limit(limit * 1)
        .skip((page-1) * limit)
        .exec();

        // const count= await product.find({
        //     unlisted:0,
        //     $or:[
        //         {title:{$regex:'.*' + search + '.*',$options:'i'}},
        //         {category:{$regex:'.*'+search+'.*',$options:'i'}}  
        //     ]
        
        // }).countDocuments();     
      
        if (products) {
           // console.log(products);
          //  return res.render('user_Products_List', { title: ' ', totalPages:Math.ceil(count/limit),currentPage:page,products: products,user:userData,cart:req.session.cart });
          const itemsperpage = 3;
          const currentpage = parseInt(req.query.page) || 1;
          const startindex = (currentpage - 1) * itemsperpage;
          const endindex = startindex + itemsperpage;
          const totalpages = Math.ceil(products.length / 3);
          let currentproduct = products.slice(startindex,endindex);
          return res.render('user_Products_Search',{products:currentproduct,totalpages,currentpage,user:userData,cart:req.session.cart,wishlist:req.session.wishlist});
        }
        // else {
        //     res.render('user_Products_List', { message: "",totalPages:'',user:userData,currentPage:'',cart:req.session.cart})
        // }
    }
    else{
        //res.send("No data available");
        //res.render('user_Products_List', { title: ' ', products: '',cart:req.session.cart,totalPages:'',currentPage:'',user:userData });
   const itemsperpage = 3;
    const currentpage = parseInt(req.query.page) || 1;
    const startindex = (currentpage - 1) * itemsperpage;
    const endindex = startindex + itemsperpage;
    // const totalpages = Math.ceil(products.length / 3);
    const totalpages =1;
    // let currentproduct = products.slice(startindex,endindex);
    return res.render('user_Products_Search',{products:'',totalpages,currentpage,user:''});
    }
    } catch (error) {
        console.log(error)
        return res.status(500).send("Server Error");
    }
}
//delete image
const deleteImage=async(req,res)=>{
    try{ 
        const id=(req.params.id);
        //var myId = JSON.parse(productId);

       // var hex = /[0-9A-Fa-f]{6}/g;
       // id = (hex.test(id))?ObjectId(id) : id;
        const imageId = req.query.imageId;
      //  console.log(productId);
      // const Product=await product.find({_id: productId,images:[imageId]}); 
      const Product=await product.findOne({"_id":  id}); 
       console.log(Product);
       if (!Product.images) {
        return res.status(404).json({ message: 'Product not found' });
      }

    //   let imageIndex;
    //   let length=Product.images.length;
    //   for (var index = length - 1; index >= 0; --index) {
    //     if (Product.images[index].indexOf(imageId) !== -1) {
    //        // product.images.splice(index, 1);
    //         imageIndex = Product.images.indexOf(imageId);
    //     }
        
    //   }
      console.log(Product.images);
    var imageIndex = Product.images.filter(function(item) {
        return item.indexOf(imageId)
      })
     // const imageIndex = Product.images.indexOf(imageId);

      if (imageIndex === -1) {
        return res.status(404).json({ message: 'Image not found for the specified product' });
      }
  
      // Remove the image from the array
      Product.images.splice(imageIndex, 1);
  
      // Save the updated product
      await Product.save();
  
      res.json({ message: 'Image deleted successfully', updatedProduct: Product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
   }

   //edit image
   const editProductImage=async(req,res)=>{

    try{ 
      
             
        await product.updateOne(
                {
                  _id: req.params.id,"images":req.params.id
                  
                },
                { $push: { "images.$":req.session.prodFileName} }
              );


        }catch(error){
         console.log(error);
         return res.status(500).send("Server Error");
       }
   }

   //load user product list
   const loadUserProductList=async(req,res)=>{
   
    try{

      const products=await product.find()
      .populate('category_id');
      let userData;
      console.log(req.session.user_id );
      if( req.session.user_id!=='undefined'){
          userData = await User.findOne({ _id: req.session.user_id }); 
          console.log(userData);
          if( userData?.cart_Data){ //  ?. optional chaining for checking null
            req.session.cart=userData.cart_Data;
            }
          else{
           req.session.cart=[];
           }
        
             if( userData?.wishlist_Data){
             req.session.wishlist=userData.wishlist_Data;
            }
        else{
           req.session.wishlist=[];
           }
       }  
      
      else{
        userData='undefined';
        req.session.wishlist='undefined';
        req.session.cart='undefined';

        if(products){
          return res.render('user_Product_List',{products:products});
        }

      }
       
       if(products){
          res.render('user_Product_List',{products:products,user:userData,cart:req.session.cart,wishlist:req.session.wishlist});
        }
     }catch(error){
      console.log(error)
      return res.status(500).send("Server Error");
    }
}
  // load user product search

  const loadUser_Product_Search=async(req,res)=>{
   // res.render('user_Product_search')
    try{

      const products=await product.find()
      .populate('category_id');
     // console.log(products)
      let userData;
     // console.log(req.session.user_id );
      if( req.session.user_id!=='undefined'){
          userData = await User.findOne({ _id: req.session.user_id }); 
          console.log(userData);
          if( userData?.cart_Data){ //  ?. optional chaining for checking null
            req.session.cart=userData.cart_Data;
            }
          else{
           req.session.cart=[];
           }
        
             if( userData?.wishlist_Data){
             req.session.wishlist=userData.wishlist_Data;
            }
        else{
           req.session.wishlist=[];
           }
       }  
      
      else{
        userData='undefined';
        req.session.wishlist='undefined';
        req.session.cart='undefined';


      


        if(products){
          const itemsperpage = 3;
          const currentpage = parseInt(req.query.page) || 1;
          const startindex = (currentpage - 1) * itemsperpage;
          const endindex = startindex + itemsperpage;
          const totalpages = Math.ceil(products.length / 3);
          let currentproduct = products.slice(startindex,endindex);
          return res.render('user_Products_Search',{products:currentproduct,totalpages,currentpage});
        }

      }
       
       if(products){
        const itemsperpage = 3;
        const currentpage = parseInt(req.query.page) || 1;
        const startindex = (currentpage - 1) * itemsperpage;
        const endindex = startindex + itemsperpage;
        const totalpages = Math.ceil(products.length / 3);
        let currentproduct = products.slice(startindex,endindex);
          res.render('user_Products_Search',{products:currentproduct,user:userData,cart:req.session.cart,wishlist:req.session.wishlist,totalpages,currentpage});
        }
     }catch(error){
      console.log(error)
      return res.status(500).send("Server Error");
    }


  }
module.exports = {
 getAllProducts,
 getProductDetails,
 loadUserProductList,
 deleteImage,
 editProductImage,
 loadUser_Product_Search
}

