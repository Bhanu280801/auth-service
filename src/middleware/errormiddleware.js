export const errorHandler =(err , req , res , next)=>{

    console.error(" Error:", err.message);

    const statusCode = err.message ||  500

    res.status(statusCode).json({
        success : false,
        message : err.message || "Internal Server Error",

    })
}