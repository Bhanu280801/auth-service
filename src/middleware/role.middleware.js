export const authorizeRoles = (...allowedRole)=>{

return (req,res,next)=>{
console.log(req)
    if(!req.user || !req.user.role){
    return res.status(403).json({
        success : false,
        message : "Access denied"
    })
    }

    if(!allowedRole.includes(req.user.role)){
        return res.status(403).json({
            success : false,
            message :'You do not have permission to access this resource'
        })
    }
    next();
}
}