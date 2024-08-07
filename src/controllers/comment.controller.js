import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.models.js"
//TODO Done : get all comments associated with a video
const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId");
    }
    //check if video exists or not
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400, "Video does not exists");
    }
    const pageNumber = parseInt(page, 10);
    const limitSize = parseInt(limit, 10);

    const getComments = await Comment.aggregate([
        {
            $match : {
                video: mongoose.Types.ObjectId(videoId),
            }
        },
        {   //likes associated with comments
            $lookup:
            {
                from:"likes",
                localField: "_id",
                foreignField: "comment",
                as: "comment_likes",
            }
        },
        {
            $addFields: {
                likesCount: { 
                    $size: "$comment_likes",
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner", 
                foreignField: "_id",
                as: "user_details",
                pipeline:[
                    {
                        $project:{
                            fullname: 1,
                            avatar: 1,
                            username: 1
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
                details: {
                    $first: "$user_details"
                }
            }
        },
        {
            $project: {
                comment_likes: 0, // excluding the `comment_likes` from the final result

            }
        },
        {
            $skip: (pageNumber - 1) * limitSize,
        },
        {
            $limit: limitSize,
        }
    ])

    if(!getComments){
        throw new ApiError(500, "Something went wrong while fetching comments from db");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, getComments, "Successfully fetched comments")
    );

})
// TODO Done: add a comment to a video
const addComment = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    const {comment} = req.body
    
    //check if valid videoid
    if(!isValidObjectId(videoId)) throw new ApiError(400, "Invaild videoId");
    
    //check if video exists or not
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400, "video does not exists");
    }

    //check if comment is not empty
    if(!comment) throw new ApiError(400, "Empty comment not Allowed");
    if(comment.trim().length ===0){
        throw new ApiError(400, "Content Must be provided")
    }
    const user = req.user?._id
    if(!user){
        throw new ApiError(400, "Invalid User id");
    }

    const commentResponse = await Comment.create({
        content: comment,
        video: videoId,
        user: user,
    })
    if(!commentResponse){
        throw new ApiError(500,"Something went wrong While posting the Comment");
    }
    const {username, avatar, fullName, _id} = req.user;
    const commentData ={
        ...commentResponse._doc,
        owner:{
            username, avatar, fullName, _id
        },
        likesCount:0,
        isOwner: true,
    }
    return res
    .status(200)
    .json( new ApiResponse(200, commentData, "Successfully Posted the Comments!!!"))
})

// TODO Done: update a comment
const updateComment = asyncHandler(async (req, res) => {
    
    const {commentId} = req.params;
    const{content} = req.body;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment Id");
    }
    //check if comment exists or not
    const iscomment = await Comment.findById(commentId);
    if(!iscomment){
        throw new ApiError(400, "Comment does not exists");
    }

    if(!content){
        throw new ApiError(400, "Content Can not be Empty");
    }
    if(content.trim().length ===0 ){
        throw new ApiError(400, "Content must be Provided");
    }

    const comment =  await Comment.findByIdAndUpdate(
        commentId,
        {
            content: content,
        }, {
            new:true
        }
    )

    return res
    .status(200)
    .json( new ApiResponse( 200, comment, "Successfully Updated the Comment"));

})
// TODO Done: delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    
    const {commentId} = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment Id");
    }

    //check if comment exists or not
    const iscomment = await Comment.findById(commentId);
    if(!iscomment){
        throw new ApiError(400, "Comment does not exists");
    }
    
    const deleteComment = await Comment.findByIdAndDelete(commentId);

    if(!deleteComment){
        throw new ApiError(500, "Something went Wrong while deleting the comment");

    }
    const deleteCommentLike = await Like.deleteMany({
        comment: mongoose.Types.ObjectId(commentId),
    });

    return res
    .status(200)
    .json(
        new ApiResponse(200, "Successfully Deleted The Comment")
    );

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }