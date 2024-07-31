import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.models.js"
import {User} from "../models/users.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary, deleteFilesCloudnary} from "../utils/FileUploadAndDelete.js"


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

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    // 
})

//TODO: update video details like title, description, thumbnail
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    //Check if video exists or not
    if(!isValidObjectId(videoId)) throw new ApiError(400, "Invalid Video Id")
    
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

//TODO: delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
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