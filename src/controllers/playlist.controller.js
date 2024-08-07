import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.models.js"
//TODO Done: create playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    
    if(!name || !description){
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name: name,
        description:description,
        owner: req.user._id,
    })

    if(!playlist){
        throw new ApiError(500, "Could not create playlist")
    }

    res
    .status(201)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist created successfully"
        ));
    
})

//TODO: get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
})

//TODO: get playlist by id
const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist Id");
    }
    const isPlaylist = await Playlist.findById(playlistId);
    if(!isPlaylist){
        throw new ApiError(400, "Playlist not Found");
    }
    
})

// TODO Done: add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist Id");
    }
    const isPlaylist = await Playlist.findById(playlistId);
    if(!isPlaylist){
        throw new ApiError(400, "Playlist not Found");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError("Invalid Video Id");
    }

    const isVideo = await Video.findById(videoId)
    if(!isVideo){
        throw new ApiError(400, "Video does not exist");
    }
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $addToSet: {
            videos: videoId,
          },
        },
        {
          new: true,
        }
      );
    
      if (!playlist)
        throw new ApiError(500, "Error while adding video to playlist");
    
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isAdded: true },
            "Video added to playlist successfully"
          )
        );
})

 // TODO Done: remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist Id");
    }
    const isPlaylist = await Playlist.findById(playlistId);
    if(!isPlaylist){
        throw new ApiError(400, "Playlist not Found");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError("Invalid Video Id");
    }
    
    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
          $pull: {
            videos: videoId,
          },
        },
        {
          new: true,
        }
      );
    
      if (!playlist)
        throw new ApiError(500, "Error while removing video from playlist");
    
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { isSuccess: true },
            "Video removed from playlist successfully"
          )
        );
})


// TODO Done: delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist Id");
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
    if (!deletedPlaylist) {
        throw new ApiError(500, "Error while deleting the Playlist");
    }
    return res
    .status(200)
    .json(
      new ApiResponse(200,  { isSuccess: true }, "Playlist deleted successfully")
    );
})


 //TODO Done: update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
   
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist Id");
    }
    const isPlaylist = await Playlist.findById(playlistId);
    if(!isPlaylist){
        throw new ApiError(400, "Playlist not Found");
    }
    if(!name || !description){
        throw new ApiError(400, "Name and description are required")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        isPlaylist._id,
        {
          name: name ? name :isPlaylist.name,
          description: description ? description : isPlaylist.description,
        },
        { new: true }
      );
    
      if (!updatedPlaylist) {
        throw new ApiError(500, "playlist cannot be updated");
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, updatedPlaylist, "playlist updated successfully")
        );
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}