import mongoose , {Schema} from "mongoose";

const likeSchema = new Schema(
    {
        video:{
            type: Schema.Types.ObjectId,
            ref:"Video",
        },
        comment:{
            type: Schema.Types.ObjectId,
            ref:"comment",
        },
        tweet:{
            type: Schema.Types.ObjectId,
            ref:"Tweet",
        },
        likedby:{
            type: Schema.Types.ObjectId,
            ref:"User",
        },
    },{
        timestamps:true
    }
)

export const Like = mongoose.model("Like", likeSchema)


// Separate Documents: Each like is stored as a separate document.
//This means there will be different documents for likes on videos, comments,
// and tweets, even if they are liked by the same user.