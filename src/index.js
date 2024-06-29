// require('dotenv').config({path:'./.env'});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from './app.js'

dotenv.config({
    path: "./.env"
});


connectDB()
.then(()=>{
    app.on("error",(err)=>{
        console.log("Error connecting to the server", err);
        throw err
    })
    app.listen(process.env.PORT || 8000 ,()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo Db connection Failed!!", err);
})
















// import express from "express";
// const app= express();   
// ;( async()=> {
//     try{
//         await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
//         app.on("error",( error)=>{
//             console.log("Error connecting to the server",error);
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`Server is running on port ${process.env.PORT}`)
//         })
//     }
//     catch(error){
//         console.error("Error: ", error)
//         throw err
//     }
// })()  // IIFE

