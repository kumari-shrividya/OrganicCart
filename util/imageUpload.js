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

const upload=multer({
    storage:multerStorage,
    fileFilter:multerFilter
});

const uploadFiles=upload.array('image',4);

uploadImages=(req,res,next)=>{
    uploadFiles(req,res,(err)=>{
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

resizeImages=async(req,res,next)=>{

    try{

  
    if(!req.files) return next();
    req.body.image=[];
    await Promise.all(
        req.files.map(async(file)=>{
            let fileName=file.originalname.replace(/\..+$/,'');
             fileName=file.originalname.split(' ').join('-');
             const newFileName=`${fileName}-${Date.now()}.jpeg`;
             await sharp(file.buffer)
                    .resize(250,225)
                    //.toFormat('.jpeg')
                    .toFile(`./public/images/product/${newFileName}`);
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
    uploadImages,
    resizeImages
}