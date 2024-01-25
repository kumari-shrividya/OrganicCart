const isLogin=async(req,res,next)=>{

    try{
        if(req.session.user_id){}
        else{
            return  res.redirect('/login');
        }
        next();

    }catch(error){
        console.log(error.message);
        return res.status(500).send("Server Error");
    }
}

const isLogout=async(req,res,next)=>{

    try{
        if(req.session.user_id){
            return   res.redirect('/userHome');
        }
        next();

    }catch(error){
        console.log(error.message);
        return res.status(500).send("Server Error");
    }
}
module.exports={
    isLogin,
    isLogout
}