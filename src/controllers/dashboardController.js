import mongoose from "mongoose"
import VideoModel from "../models/videoModel.js"
import {Subscription} from "../models/subscription.Model.js"
import {LikeModel} from "../models/likeModel.js"
import {ApiError} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    res.send("Feature is not builed yet")
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    res.send("this Feature is not develop yet")
}) 


export {
    getChannelStats, 
    getChannelVideos
    }