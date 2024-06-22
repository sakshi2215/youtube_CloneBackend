import mongoose, {Schema} from "mongoose";

const userSchema = new Schema({
    username: {
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true   // To enable searching in db
    },
    email:{
        type:String,
        required:true,
        unique:true,
                lowercase:true,
        trim:true,
    },
    fullname:{
        type: String,
        required: true,
        trim:true,
        index:true
    },
    avatar: {
        type: String, //cloudnary url
        required:true,

     },
     coverImage:{
        type:String,

     },
     watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type: String,
        required:[ true, "Password is required"]
    },
    refreshToken:{
        type:String,

    }
},{
    timestamps:true
})


export const user = mongoose.model("User", userSchema) 