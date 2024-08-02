import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

//TODO Done: toggle like on video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const{userId} = req.user?._id;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id");
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id");
    }

    //Check if user has Liked the video
    const existingLike = await Like.findOne({
        video: videoId,
        likedby: userId,
    })
    //If a like record exists 
    if(existingLike){
        //Proceed with unliking the post
        await Like.deleteOne({
            _id: existingLike._id,
        })
    }
    else{
        const createLike = await Like.create({
            video:videoId,
            likedby:userId,
        })
        if(!createLike){
            throw new ApiError(500, "Error While Updating the Likes");
        }
    }

    //count the total likes a video has
    const likeCount = await Like.countDocuments({
        video:videoId,
    });

    const liked = !existingLike;
    const Likedata = {
        liked,
        likeCount
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, Likedata, message= liked? "Video liked Successfully" : "Video Unliked Successfully")
    );
    
})

 //TODO Done: toggle like on comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const{userId} = req.user?._id;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment Id");
    }
    if(!userId){
        throw new ApiError(400, "Invalid user Id");
    }

    //check if the user can liked the comment or not
    const existingLike = await Like.findOne({
        comment: commentId,
        likedby: commentId,
    })

    if(existingLike){
        //Proceed With unliking the comments
        await Like.deleteOne(
            {
                _id: existingLike._id
            }
        )
    }
    else{
        const createLike = await Like.create({
            comment: commentId,
            likedby:userId,
        })
        if(!createLike){
            throw new ApiError(500, "Error While Updating the Likes");
        }
    }
    //count the total likes a comment has
    const likeCount = await Like.countDocuments({
        comment: commentId,
    });

    const liked = !existingLike;
    const Likedata = {
        liked,
        likeCount
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, Likedata, message= liked? "Comment liked Successfully" : "Comment Unliked Successfully")
    );
    


})

 //TODO Done: toggle like on tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
   
    const{userId} = req.user?._id;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid Comment Id");
    }
    if(!userId){
        throw new ApiError(400, "Invalid user Id");
    }

    //check if the user can liked the tweet or not
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedby: commentId,
    })

    if(existingLike){
        //Proceed With unliking the tweet
        await Like.deleteOne(
            {
                _id: existingLike._id
            }
        )
    }
    else{
        const createLike = await Like.create({
            tweet: tweetId,
            likedby:userId,
        })
        if(!createLike){
            throw new ApiError(500, "Error While Updating the Likes");
        }
    }
    //count the total likes a comment has
    const likeCount = await Like.countDocuments({
        tweet: tweetId,
    });

    const liked = !existingLike;
    const Likedata = {
        liked,
        likeCount
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, Likedata, message= liked? "Tweet liked Successfully" : "Tweet Unliked Successfully")
    );
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}