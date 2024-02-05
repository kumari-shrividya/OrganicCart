const multer=require('multer');
const sharp=require('sharp');
const multerStorage=multer.memoryStorage();

//validate file type
const FILE_TYPE_MAP={ 
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}
const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }
    else{
        cb('Please upload images !',false);
    }
};

const uploadcat=multer({
    storage:multerStorage,
    fileFilter:multerFilter
});

const uploadFile=uploadcat.single('image');

uploadImage=(req,res,next)=>{
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