import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {Like} from "../models/like.models.js"
import {Playlist} from "../models/playlist.models.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFilesCloudnary} from "../utils/FileUploadAndDelete.js"
import {getVideoComments}from "./comment.controller.js"
import {getVideoLikes} from "./like.controller.js"

//TODO Done: get all videos based on query, sort, pagination
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const {searchAfterValue, searchBeforeValue} = req.params
    
    query = query.trim();
    if(!sortBy){
        sortBy = "views"
    }
    //const pagenumber = parseInt(page,10);
    const pageSize = parseInt(limit, 10);
    const sortOrder = sortType==="desc"?-1 :1;
    const isFirstQuery = !searchAfterValue && !searchBeforeValue; // Check if it's the first query
    const isForwardPagination = searchAfterValue; // Check if pagination is forward
    const isBackwardPagination = searchBeforeValue;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "User Id is Invalid");
    }
    // const videos = await Video.aggregate([
    //     {}
    // ])

    let pipeline = [
        {
            $match:{
                isPublished: true,
            }
        },

    ]
    //if the user has provided the query then only will be search stage and pagination token will be generated
    //Ref - https://www.mongodb.com/docs/atlas/atlas-search/tutorial/divide-results-tutorial/
    if (query) {
        let searchStage = {
            $search: {
                "index": "query_search",
                "text": {
                    "path": "title",
                    "query": query
                },
                "sort": sortBy ? { [sortBy]: 1 } : { "views": 1 } 
            }
        };
    
        if (isForwardPagination) {
            searchStage.$search.searchAfter = [searchAfterValue];
        }
    
        if (isBackwardPagination) {
            searchStage.$search.searchBefore = [searchBeforeValue];
            searchStage.$search.sort = sortBy ? { [sortBy]: -1 } : { "views": -1 }; // Reverse sorting for backward pagination
        }
    
        pipeline.push(searchStage);
    }
    
    //if no query provided then use sort
    if (!query) {
        pipeline.push({
            "$sort": {
                [sortBy || 'views']: sortOrder
            }
        });
    }
    //adding user details lookup for creator 
    pipeline.push({
        $lookup:{
            from :"users",
            localField: "owner",
            foreignField: "_id",
            as: "creator",

            pipeline: [
                {
                    $project:{
                        username:1,
                        fullname:1,
                        avatar:1,

                    },
                },
            ],
        },
        
    });
    //adding pagiation stage for limit
    pipeline.push(
       {
            "$limit" : pageSize,
        }
    );

    //adding projection stage
    pipeline.push({
        "$project":{
        _id: 1, 
        videofile: 1, // Include the videofile field
        thumbnail: 1, // Include the thumbnail field
        title: 1, // Include the title field
        description: 1, // Include the description field
        duration: 1, // Include the duration field
        views: 1, // Include the views field
        isPublished: 1, // Include the isPublished field
        owner: 1, // Include the owner field
        creater :1,
        ...(query ? { 
            paginationToken: { $meta: "searchSequenceToken" },
            score: { $meta: "searchScore" }
        } : {})
        }
    })

    const allVideos = await Video.aggregate(pipeline);
    if(!allVideos){
        throw new ApiError(500, "Something went wrong while fetching the videos");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "All videos sent successfully"));
})

// TODO- DONE: get video, upload to cloudinary, create video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body


    //Check if title is there or not, title is required
    if(!title) throw new ApiError(400, "Title is required")

    if(!description) throw new ApiError(400, "Description is required")
    
    //Fetch the local file path for video
    const videoLocalPath = req.files?.videoFile[0]?.path;
    if(!videoLocalPath) throw new ApiError(400, "Video file is required")
    
    // //Check the file type of video
    const videoFileType = req.files?.videoFile[0]?.mimetype;

    if(!(videoFileType === "video/mp4" || videoFileType==="video/webm" 
        || videoFileType==="video/x-m4v" )){
            throw new ApiError(400, "Only video files are allowed")
        }
    

    //Fetch the local file path for thumbnail
    let thumbnailLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length >0){
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }
    if(!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required")

    //Upload video and thumbnail to cloudinary
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    if (!videoFile) throw new ApiError(500, "Error while Uploading Video File");

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if(!thumbnail) throw new ApiError(500, "Error while Uploading Thumbnail File");
    
    //Create video in database
    const videoUpload= await Video.create({
        title,
        videofile: videoFile.url,
        thumbnail: thumbnail.url,
        description: description || "",
        duration: videoFile.duration,
        owner: req.user._id
    })
    if(!videoUpload) throw new ApiError(500, "Error while uploading video")
    
    // console.log(videoUpload)

    //send response
    return res
    .status(200)
    .json(new ApiResponse(200,  videoUpload, "Video uploaded successfully"))
    
})

 //TODO: get video by id
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400, "Could not find the video");
    }
    //get comment related to video from comment controller
    const comments = await getVideoComments(videoId);
    //get likes related to video from likes contrller
    const likes = await getVideoLikes(videoId);
    
    const videoData = {
        ...video.toObject(),
      comments,
      likes,
    };
    return res
    .status(200)
    .json(
        new ApiResponse(200, videoData, "Successfully get video by id")
    )
})

//TODO- DONE: update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    //Check if video exists or not
    if(!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video Id")
    

    //check if video exists or not
    const isvideo = await Video.findById(videoId);
    if(!isvideo){
        throw new ApiError(400, "Video does not exists");
    }

    //Get title and description from the user
    const { title, description} = req.body
    

    //Check if title is there or not, title is required
    if(!title) throw new ApiError(400, "Title is required")
    
    //check if description is there or not
    if(!description) throw new ApiError(400, "Description is required")
        
    //Get thumbnail Local Path
    let thumbnailLocalPath;
    if(req.file && Array.isArray(req.file.thumbnail) && req.file.thumbnail.length >0){
        thumbnailLocalPath = req.file.thumbnail[0].path;
    }
    let thumbnail;
    if(thumbnailLocalPath){
        //Delete the old thumnail from cloudinary and upload the new One
        const video = await Video.findById(videoId);
        if(!video) throw new ApiError(404, "Video not found");
        const oldThumbnailUrl = video.thumbnail;

        if(!oldThumbnailUrl) throw new ApiError(400, "Thumbnail is not in Database!!!")
        const deleteResponse = await deleteFilesCloudnary(oldThumbnailUrl);
        if(!deleteResponse) throw new ApiError(500, "Error while deleting old thumbnail")
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(!thumbnail) throw new ApiError(500, "Error while Uploading Thumbnail File");
        }
    
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            title,
            description,
            thumbnail: thumbnail ? thumbnail.url : video.thumbnail
        },
        {new: true}
    )
    if(!video){
        throw new ApiError(400, "Something Went Wrong after Updating the Video");
    }
    return res
    .status(200)
    .json( new ApiResponse(200, video, "Video Succesfully Updated"));
})

//TODO DONE: delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)) throw new ApiError("Invalid VideoId");
    
    //check if video exists or not
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400, "Video does not exists");
    }
    
    //deleted the video 
    const videodetail = await Video.findByIdAndDelete(videoId);
    if(!videodetail) throw new ApiError("Video Not Found");
    
    //deletes the video thumbnail
    const thumbnailurl = videodetail.thumbnail;
    await deleteFilesCloudnary(thumbnailurl);
    
    //Delete from cloudnary
    const videoFile = videodetail.videofile;
    await deleteFilesCloudnary(videoFile);
    
    //To Do deleting the video likes
    const deleteVideoLikes = await Like.deleteMany({
        video: mongoose.Types.ObjectId(videoId),
    })
    
    //Deleting the comments
    const deleteComment = await Comment.deleteMany({
        video:mongoose.Types.ObjectId(videoId)
    })

    //Deleting the likes associated with comments
    //1. Find all comments related to video
    const videoComment = await Comment.find({
        video: mongoose.Types.ObjectId(videoId)
    })
    //2. Extract the comment ids "hehe enumeration function- Check notes"
    const commentID = videoComment.map(comment => comment._id)
    //3. Delete all the likes associated with comment id array
    const deleteCommentLike = await Like.deleteMany({
        comment: {
            $in: commentID
        }
    })

    const deleteVideoFromPlaylist = await Playlist.updateMany({
        videos: mongoose.Types.ObjectId(videoId)
    },{
        $pull :{ videos : mongoose.Types.ObjectId(videoId)}
    })
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, [], "Video Deleted Successfully!!!")
    )

})


// TODO Done: change whether a video is publicly accessible or not
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video Id")
    }

    //find the video with video- id mentioned
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400, "Could not find the video");
    }
    video.isPublished = !video.isPublished;
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Successfully updated the Publish Status" )
    );
    // const changePublishStatus = await Video.findByIdAndUpdate(videoId,{
    //     isPublished: !i
    // })
    

    
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}