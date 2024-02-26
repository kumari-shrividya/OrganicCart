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



// }
module.exports={
    uploadImage,
    resizeImage,
    uploadCategoryImage
}