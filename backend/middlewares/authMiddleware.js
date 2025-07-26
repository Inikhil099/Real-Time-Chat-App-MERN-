const jwt = require("jsonwebtoken")
const { getUser } = require("../services/auth")

async function verifyToken(req,res,next) {
    const token = req.cookies.uid;
    if(!token){
        return res.status(400).send("you are not ")
    }
    const user = getUser(token)
    if(!user){
        return res.status(403).send("Token is not valid login again")
    }
    req.user = user;

    next()
}


module.exports = {verifyToken}