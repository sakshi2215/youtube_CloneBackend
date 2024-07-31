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

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}