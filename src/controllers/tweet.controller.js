import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//TODO Done: create tweet
const createTweet = asyncHandler(async (req, res) => {
   
    const {content} = req.body;
    if(!content){
        throw new ApiError(400, "Invalid Tweet");
    }
    if(content.trim().length===0){
        throw new ApiError(400, "Tweet cannot be Empty");
    }
    const owner = req.user?._id
    if(!isValidObjectId(owner)){
        throw new ApiError(400, "Invalid user")
    }

    const tweet = await Tweet.create(
        {
            content:content,
            owner : owner
        }
    );

    if(!tweet){
        throw new ApiError(500, "Error while creating the Tweet");
    }
    const tweetData = {
        ...tweet._doc,
        owner:{
            fullname: req.user?.fullname,
            username : req.user?.username,
            avatar: req.user?.avatar,
        },
        likes:0,
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,"Successfully created the Tweet")
    );
})

// TODO Done: get user tweets  
const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.user?._id;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id");
    }

    const userTweet = await Tweet.aggregate([
        {
            $match:{
                owner : mongoose.Types.ObjectId(userId),
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'tweet',
                as: 'likes'
            }
        },
        {
            $addFields: {
                likeCount: { $size: '$likes' }
            }
        },
        {
            $project: {
                _id: 1,
                likeCount: 1
            }
        }
    ])

    if(!userTweet){
        throw new ApiError(500, "Could not fetch tweet associated with user");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, userTweet, "Successfully fetched user Tweet along with likes count!!!")
    );
})

//TODO Done: update tweet
const updateTweet = asyncHandler(async (req, res) => {
    
    const{tweetId} = req.params;
    const {content } = req.body;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet Id");
    }
    
     //check if Tweet exists or not
     const istweet = await Tweet.findById(tweetId);
     if(!istweet){
         throw new ApiError(400, "Tweet does not exists");
     }

    if(!content){
        throw new ApiError(400, "Content must be Provided");
    }
    if(content.trim().length ===0){
        throw new ApiError(400, "Content must be Provided");
    }

    const tweetUpdate = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: content
        }
    )
    return res
    .status(200)
    .json(
        new ApiResponse(200, tweetUpdate, "Successfully Updated the tweet")
    );
})


//TODO Done: delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const{tweetid} = req.params;

    if(!isValidObjectId(tweetid)){
        throw new ApiError(400, "Tweet Id is Invalid");
    }

    //check if Tweet exists or not
    const istweet = await Tweet.findById(tweetid);
    if(!istweet){
        throw new ApiError(400, "Tweet does not exists");
    }

    const deleteTweet = await Tweet.findAndDelete(tweetid);

    if(!deleteTweet){
        throw new ApiError(500, "Error while deleting the Tweet");
    }

    const deleteTweetLike = await Like.deleteMany({
        tweet: mongoose.Types.ObjectId(tweetid)
    });
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, "Successfully Deleted the Tweet")
    );
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}