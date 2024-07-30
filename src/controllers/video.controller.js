import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/users.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/FileUploadAndDelete.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    
    // TODO: get video, upload to cloudinary, create video

    //Check if title is there or not, title is required
    if(!title) throw new ApiError(400, "Title is required")

    if(!description) throw new ApiError(400, "Description is required")
    
    //Fetch the local file path for video
    const videoLocalPath = req.files?.videoFile[0]?.path;
    if(!videoLocalPath) throw new ApiError(400, "Video file is required")
    
    // //Check the file type of video
    // const videoFileType = req.files?.videoFile[0]?.mimetype;

    // if(!(videoFileType === "video/mp4" || videoFileType==="video/webm" 
    //     || videoFileType==="video/x-m4v" )){
    //         throw new ApiError(400, "Only video files are allowed")
    //     }
    

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

    const videoUpload= await Video.create({
        title,
        videofile: videoFile.url,
        thumbnail: thumbnail.url,
        description: description || "",
        duration: videoFile.duration,
        owner: req.user._id
    })
    if(!videoUpload) throw new ApiError(500, "Error while uploading video")
    
    console.log(videoUpload)

    return res
    .status(200)
    .json(new ApiResponse(200,  videoUpload, "Video uploaded successfully"))
    
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}