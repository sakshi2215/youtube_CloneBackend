import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async() => {
    try{
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        //console.log(connectionInstance)
        console.log(`\n Connected to the database!! DB HOST: ${connectionInstance.connection.host}`)
    }
    catch(error){
        console.error("Error: ", error);
        process.exit(1); //node js we can exit the process
        throw error
    }
}

export default connectDB;