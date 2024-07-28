import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()
//app.use for configuration
//configuration of CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN, //Define cors origin
    credentials: true, 
}))

//Settings for Data Preparation
app.use(express.json({limit:"16kb"})) //Setting limit for json data
app.use(express.urlencoded({extended: true, limit:"16kb"})) //extended:nested object we can use
//Also url is encode so we use urlencoded.
app.use(express.static("public")) //Public assests for storing file in server
app.use(cookieParser()) //To access user cookies and perform curd 



//routes
import userRouter from './routes/user.routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)

//http://localhost:8000/api/v1/users/register
export { app }