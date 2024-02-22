const multer=require('multer');
const sharp=require('sharp');
const multerStorage=multer.memoryStorage();
// const FileType = require('filetype');

//validate file type
const FILE_TYPE_MAP={ 
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}
const multerFilter=async(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }
    else{
       cb(new Error('Invalid file type. Only JPEG and PNG files are allowed.'),false);

        // cb('',false);
    //      if(!file.mimetype.startsWith('image')){
            
    //     try{
            
    //       const categories=await Category.find({_id:id});

    //       if(categories){
    //       return  res.render('editCategory',{categories,errors:'',data:'',message:'Please upload images'});
    //       }
    //     }catch(error){
    //   }
    //  }

  }
};

// const uploadcat=multer({
//     storage:multerStorage,
//     fileFilter:multerFilter
// });
const uploadcat=multer({
      storage:multerStorage,
   fileFilter:multerFilter
    });


const uploadFile=uploadcat.single('image');

uploadImage=async(req,res,next)=>{
    // if(!req.file) return next();

        // // Read the file and get its MIME type
        // const buffer = req.file.buffer; // Assuming you're using memory storage with Multer
        // const type = await FileType.fromBuffer(buffer);

        // // Check if MIME type is allowed
        // if (!type || (type.mime !== 'image/jpeg' && type.mime !== 'image/png')) {
        // //   return res.status(400).send('Invalid file type');
        // return res.render('editCategory',{message:'Invalid file type'});
        // }
//         if(req.file){
//         if(!req.file.mimetype.startsWith('image')){
//             const id=req.params.id;
//             try{
//              const categories=await Category.find({_id:id});
     
//              if(categories){
//                return  res.render('editCategory',{categories,errors:'',data:'',message:'Invalid file type'});
//              }
//           }catch(error){
//             // return res.render('editCategory',{message:'Invalid file type'});
//         }
//     }
//  }
    uploadFile(req,res,(err)=>{
        if(err instanceof multer.MulterError){
            if(err.code==='LIMIT_UNEXPECTED_FILE'){
                return res.send('Too many files to upload!');
            }

        }else if(err){
            return res.send(err);
        }
        next();
    });
}

resizeImage=async(req,res,next)=>{

    try{
    if(!req.file) return next();

    // if(req.file){
    //     if(!req.file.mimetype.startsWith('image')){
    //         return res.render('editCategory',{message:'Invalid file type'});
    //     }
    // }

    // req.body.image=[];
    // await Promise.all(
    //     req.files.map(async(file)=>{
    //         let fileName=file.originalname.replace(/\..+$/,'');
    //          fileName=file.originalname.split(' ').join('-');
    //          const newFileName=`${fileName}-${Date.now()}.jpeg`;
    //          await sharp(file.buffer)
    //                 .resize(250,225)
    //                 //.toFormat('.jpeg')
    //                 .toFile(`./public/images/category/${newFileName}`);
    //                 req.body.image.push(newFileName);

    //     })
    // );
    // next();
    let fileName=req.file.originalname.replace(/\..+$/,'');
    fileName=req.file.originalname.split(' ').join('-');
   const imageUrl=`${fileName}-${Date.now()}.jpeg`;
   //console.log(imageUrl);
   const processedImageBuffer= await sharp(req.file.buffer)
   .resize({width:250,height:225})
   .toFormat('jpeg')
   .toFile('./public/images/category/'+imageUrl);  
    req.session.fileName=imageUrl;
  // console.log(req.session.fileName);
  next();
    }catch(error){
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


//upload category images

// uploadCategoryImage=async(req,res,next)=>{

  
//     const multerFilter=(req,file,cb)=>{
//         if(file.mimetype.startsWith('image')){
//             cb(null,true);
//         }
//         else{
//             cb('Please upload images !',false);
//         }
//     };
//     //upload category image to memory storage crop using sharp
//     const storagecat=multer.memoryStorage();
//     //const upload=multer({storage:storage});
//     const uploadcat=multer({storage:storagecat,fileFilter:multerFilter});

//     const uploadcategory=  uploadcat.single('image')
//     try{

//     //     if(!req.files) return next();
//         let fileName=req.file.originalname.replace(/\..+$/,'');
//          fileName=req.file.originalname.split(' ').join('-');
//         const imageUrl=`${fileName}-${Date.now()}.jpeg`;
//     //     //console.log(imageUrl);

       
//     //     const processedImageBuffer= await sharp(req.file.buffer)
        
//     //     .resize({width:250,height:225})
//     //     .toFormat('jpeg')
//     //     .toFile('./public/images/category/'+imageUrl);  
//     //      req.session.editfileName=imageUrl;
//     //    // console.log(req.session.fileName);
//     //    next();
//     // }catch(error){
//     //    // console.log(error); 
//     //    return res.status(500).send(error.message);
//     // }

//     if(!req.files) return next();
//     req.body.image=[];
//     await Promise.all(
//         req.files.map(async(file)=>{
//             let fileName=file.originalname.replace(/\..+$/,'');
//              fileName=file.originalname.split(' ').join('-');
//              const newFileName=`${fileName}-${Date.now()}.jpeg`;
//              await sharp(file.buffer)
//                     .resize(250,225)
//                     //.toFormat('.jpeg')
//                     .toFile(`./public/images/category/${newFileName}`);
//                     req.body.image.push(newFileName);

//         })
//     );
//     next();
//     }catch(error){
//         console.log(error)
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
 
// }
module.exports={
    uploadImage,
    resizeImage,
    uploadCategoryImage
}