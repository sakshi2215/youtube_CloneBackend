import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/users.models.js"
import {Subcription} from "../models/subscriptions.models.js"
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

    //Check if the user has already Subscribed the channel
    const existingSubscribed = await Subcription.findOne({
        subscriber: userId,
        channel: channelId,
    })
    if(existingSubscribed){
        //Proceed with unliking the post
        await Subcription.deleteOne({
            _id: existingSubscribed._id,
        })
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Successfully Unsubcribed the channel.")
            )
    }
    else{
        const createSubscribe = await Subcription.create({
            subscriber: userId,
            channel: channelId,
        })
        if(!createSubscribe){
            throw new ApiError(500, "Error While Updating the Likes");
        }
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Successfully subscribed the channel.")
            )
    }   
})

// TODO Done: controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel Id");
    }
    
    //check if channel exists or not
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(400, "Channel does not exists");
    }

    const subscribers = await Subcription.aggregate([
        {
           $match: {
            channel: mongoose.Types.ObjectId(channelId)
           } 
        },
        {
            $lookup:{
                from: 'users', 
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriberDetails'
            }
        },
        {
            $unwind: '$subscriberDetails' // Unwind the array of subscriber details
        },
        {
            $project: {
                _id: 0,
                subscriberId: '$subscriberDetails._id',
                fullname: '$subscriberDetails.fullname',
                email: '$subscriberDetails.email',
                username: '$subscriberDetails.username',
                avatar: '$subscriberDetails.avatar'
            }
        }
    ]);

    if (!subscribers || subscribers.length === 0) {
        throw new ApiError(404, "No subscribers found for this channel");
    }
    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            subscribers, 
            "Subscriber list retrieved successfully"
        )
    );
})

//TODO Done: controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    // Validate subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber Id");
    }

    // Check if the subscriber exists
    const subscriber = await User.findById(subscriberId);
    if (!subscriber) {
        throw new ApiError(404, "Subscriber does not exist");
    }
     // Aggregate to get channels the subscriber is subscribed to
     const subscribedChannels = await Subcription.aggregate([
        {
            $match: {
                subscriber: mongoose.Types.ObjectId(subscriberId),
            },
        },
        {
            $lookup: {
                from: 'users',
                localField: 'channel',
                foreignField: '_id',
                as: 'channelDetails',
            },
        },
        {
            $unwind: {
                path: '$channelDetails',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 0,
                channelId: '$channelDetails._id',
                username: '$channelDetails.username',
                avatar: '$channelDetails.avatar',
                fullName: '$channelDetails.fullName',
            },
        },
    ]);
    if (!subscribedChannels || subscribedChannels.length === 0) {
        throw new ApiError(404, "No Subscribed Chanel found for this user");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            subscribedChannels, 
            "Subscribed channels retrieved successfully"
        )
    );

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}