import mongoose , {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const videoSchema = new Schema({

    videofile:{
        type: String,  //cloudnary
        required:true,
    },
    thumbnail:{
        type: String,
        required:true,
    },
    title:{
        type: String,
        required:true,
    },
    description:{
        type: String,
        required:true,
    },
    duration:{
        type: Number, //cloudnary url
        required:true,
    },
    views:{
        type:Number,
        default:0
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }

},{
    timestamps:true
})

userSchema.pre("save" , async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password =  bcrypt.hashSync(this.password,10)
    next()
})


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password ,this.password)
}
videoSchema.plugin(mongooseAggregatePaginate)

export const video = mongoose.models("Video", videoSchema)