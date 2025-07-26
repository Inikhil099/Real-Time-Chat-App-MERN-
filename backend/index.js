const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const http = require("http")
const cookieparser = require("cookie-parser")
const PORT = 3000;
const userRouter = require("./routes/userRoute")
const contactRouter = require("./routes/contactRoutes")
const messagesRouter = require("./routes/messagesRoutes")
const channelRouter = require("./routes/channelRoutes")
const { connectDb } = require("./dbconnection")
const { setUpSocket } = require("./socket/setupSocket")

dotenv.config();

const app = express();
const server = http.createServer(app)



connectDb("mongodb://127.0.0.1:27017/chatApp").then(()=>{
    console.log("db is connected")
})

app.use(cors({
    origin:[process.env.ORIGIN],
    methods:["GET","POST","PUT","PATCH","DELETE"],
    credentials:true,
}))

app.use(cookieparser())
app.use(express.json())


app.use("/uploads/profiles",express.static("uploads/profiles"))
app.use("/uploads/files",express.static("uploads/files"))


app.use("/user",userRouter)
app.use("/contacts",contactRouter)
app.use("/api/messages",messagesRouter)
app.use("/api/channel",channelRouter)

 
setUpSocket(server)

server.listen(PORT,()=>{
    console.log("app running","http://localhost:"+PORT)
})