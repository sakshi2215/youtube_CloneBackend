import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
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

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets  
})

//TODO Done: update tweet
const updateTweet = asyncHandler(async (req, res) => {
    
    const{tweetId} = req.params;
    const {content } = req.body;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet Id");
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

    const deleteTweet = await Tweet.findAndDelete(tweetid);

    if(!deleteTweet){
        throw new ApiError(500, "Error while deteing the Tweet");
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