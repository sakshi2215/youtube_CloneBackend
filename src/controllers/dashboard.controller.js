import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/users.models.js"

// TODO Done: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
const getChannelStats = asyncHandler(async (req, res) => {
    
    const {channelId} = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid channel Id!");
    }

    //check if comment exists or not
    const isChannel = await User.findById(channelId);
    if(!isChannel){
        throw new ApiError(400, "Channel does not exists");
    }

    const channelStats = await User.aggregate([
        {
            $match:{
                _id : mongoose.Types.ObjectId(channelId),
            }
        },
        {
            $project:{
                _id: 1,
                fullname: 1,
                email:1,
                username:1,
                avatar:1,
                coverImage:1,
            }
        },
        {   //to get the total views
            $lookup:{
                from:"videos",
                localField: "_id",
                foreignField: "owner",
                as: "videoStats",
                pipeline:[
                    {
                        $addFields: {
                            video_id: "$_id"  // Rename video ID to video_id
                        }
                    },
                    {
                        $lookup:{
                            from:"likes",
                            localField: "video_id",
                            foreignField: "video",
                            as: "videoLikes",
                            pipeline:[
                                {
                                    $group:{
                                        _id: "$video_id",   //group based on video id
                                        likesCount:{
                                            $sum:1, 
                                        }
                                    },
                                },
                                {
                                    $group:{
                                        _id: null,
                                        totalLikesCount :{
                                            $sum: "$likesCount"
                                        }
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $group:{
                            _id : null, //group the entire document and find the total videos
                            totalviews: {
                                $sum: "$views" //accumulator for total views
                            },
                            totalvideos: {
                                $sum:1,  // accumulator for total videos
                            },
                            totalLikes :{
                                $sum :{
                                    $arrayElementAt : ["$videoLikes.totalLikesCount", 0] //total Likes
                                }
                            }
                        }
                    },
                    {
                        $project:{
                            _id: 0,
                            totalviews : 1,
                            totalvideos:1,
                            totalLikes:1,
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from: "subcriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribers",
            }
        },
        {
            $addFields: {
                videoStats: { 
                    $arrayElemAt: ["$videoStats", 0] 
                },
                subscribersCount:{
                    $size:"$subscribers"
                },

            }
        },
        {
            $project: {
                _id: 1,
                fullname: 1,
                email: 1,
                username: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                "videoStats.totalViews": 1,
                "videoStats.totalVideos": 1,
                "videoStats.totalLikes": 1
            }
        },
    
        
    ])
    if(!channelStats){
        throw new ApiError(500, "Error while fetching the channel details")
    }
    return res
    .status(200)
    .json(
        new ApiResponse( 200, channelStats, "Successfully fetched the channel Dashboard!!")
    );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params;
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "invalid channel Id");
    }
    //check if comment exists or not
    const ischannel = await User.findById(channelId);
    if(!ischannel){
        throw new ApiError(400, "Channel does not exists");
    }

    const getVideo = await Video.aggregate([
        {
            $match:{
                owner : mongoose.Types.ObjectId(channelId)
            }
        },
        //get likes of video
        {
            $lookup:{
                from:"likes",
                localField: "_id",
                foreignField: "video",
                as: "video_likes",
            }
        },
        {
            $addFields: {
                likesCount: { 
                    $size: "$video_likes",
                }
            }
        }
    ])

    if(!getVideo){
        throw new ApiError(500, "Error while fetching the video from database");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, getVideo , "Successfully fetched the video Data of Channel")
    );
})

export {
    getChannelStats, 
    getChannelVideos
    }