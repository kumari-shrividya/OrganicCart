const isLogin=async(req,res,next)=>{

    try{
       // console.log(req.session.admin)
        if(req.session.admin){}
        else{
          return  res.redirect('/admin/login');
            
        }
        next();

    }catch(error){
        console.log(error.message);
        return res.status(500).send("Server Error");
    }
}

const isLogout=async(req,res,next)=>{

    try{
        if(req.session.admin){
        return    res.redirect('/admin/adminHome');
           
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