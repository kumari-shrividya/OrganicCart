const multer=require('multer');
const sharp=require('sharp');
const multerStorage=multer.memoryStorage();



const multerFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }
    else{
        cb('please upload image',false);
    //    return  cb(new Error('Only JPEG/PNG allowed!'))
    }
};

const uploadcat=multer({
    
    storage:multerStorage,
    multerFilter
    
    
});


const uploadFile= uploadcat.single('image')


uploadImage= (req,res,next)=>{
   
    uploadFile(req,res,(err)=>{
        if(err instanceof multer.MulterError){
            if(err.code==='LIMIT_UNEXPECTED_FILE'){
                return res.send('Too many files to upload!');
            }

        }
       else if(err){
            return res.send(err);
      
          
        }
        
        // next();

// if(!req.file){
//     return res.json('invalid file')
// }
// const filetype=["png","jpeg","jpg"];
// const fileext=req.file.mimetype.split('/').pop();
// if(!filetype.includes(fileext)){
//     return res.json('invalid')
// }
  next();
  });


}


resizeImage=async(req,res,next)=>{

    try{
    if(!req.files) return next();

    const filetype=["png","jpeg","jpg"];
const fileext=req.file.mimetype.split('/').pop();
if(!filetype.includes(fileext)){
    return res.json('invalid')
}


    req.body.image=[];
    await Promise.all(
        req.files.map(async(file)=>{
            let fileName=file.originalname.replace(/\..+$/,'');
             fileName=file.originalname.split(' ').join('-');
             const newFileName=`${fileName}-${Date.now()}.jpeg`;
             await sharp(file.buffer)
                    .resize(250,225)
                    //.toFormat('.jpeg')
                    .toFile(`./public/images/category/${newFileName}`);
                    req.body.image.push(newFileName);

        })
    );
    next();
    }catch(error){
        console.log(error)
        res.status(500).json({ message: 'Internal Server Error' });
    }
}


module.exports={
    uploadFile,
    uploadImage,
    resizeImage,
    // uploadCategoryImage
}