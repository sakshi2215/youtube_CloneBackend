import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {comment} = req.body
    
    //check if valid videoid
    if(!isValidObjectId(videoId)) throw new ApiError(400, "Invaild videoId");

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

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const{content} = req.body;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment Id");
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

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment Id");
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