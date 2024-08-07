import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

 // TODO Done: toggle subscription
const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const {userId} = req.user
   

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Channel Id");
    }
    //check if channel exists or not
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(400, "Channel does not exists");
    }
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid User Id");
    }

    //Check if user has Liked the video
    const existingSubscribed = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    })
    //If a like record exists 
    if(existingSubscribed){
        //Proceed with unliking the post
        await Subscription.deleteOne({
            _id: existingSubscribed._id,
        })
    }
    else{
        const createSubscribe = await Subscription.create({
            subscriber: userId,
            channel: channelId,
        })
        if(!createSubscribe){
            throw new ApiError(500, "Error While Updating the Likes");
        }
    }

    return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Subscriptiion toggled succesfully.")
  )

    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel Id");
    }
    
    
    
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}