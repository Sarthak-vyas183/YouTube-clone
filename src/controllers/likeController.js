import mongoose, { isValidObjectId } from "mongoose";
import { LikeModel } from "../models/likeModel.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import videoModel from "../models/videoModel.js";
import commentModel from "../models/commentModel.js";
import { tweetModel } from "../models/tweetModel.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");
    const Likedvideo = await videoModel.findById(videoId);
    if (!Likedvideo)
      throw new ApiError(404, "video not found : Liked source not found");
    
    const Alreadyliked = await LikeModel.findOne({
        video: Likedvideo?._id,
        likedBy: req.user?._id,
    });
    
    if(Alreadyliked) {
        await Alreadyliked.deleteOne();
        return res.status(200).json(new ApiResponse(200, Alreadyliked, "Unlike successfully"))
    }

    const likeDocument = await LikeModel.create({
      video: Likedvideo?._id,
      likedBy: req.user?._id,
    });
    if (!likeDocument) throw new ApiError(400, "Failed to like the video");
    return res
      .status(200)
      .json(new ApiResponse(200, likeDocument, "video Liked Successfully"));
  } catch (error) {
    res.status(500).send(`Internal Server Error : ${error}`);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid commentId");
        const LikedComment = await commentModel.findById(commentId);
        if (!LikedComment)
          throw new ApiError(404, "Comment not found : comment source not found");
        
        const Alreadyliked = await LikeModel.findOne({
            comment: LikedComment?._id,
            likedBy: req.user?._id,
        });
        
        if(Alreadyliked) {
            await Alreadyliked.deleteOne();
            return res.status(200).json(new ApiResponse(200, Alreadyliked, "Unlike successfully"))
        }
    
        const likeDocument = await LikeModel.create({
            comment: LikedComment?._id,
          likedBy: req.user?._id,
        });
        if (!likeDocument) throw new ApiError(400, "Failed to like the comment");
        return res
          .status(200)
          .json(new ApiResponse(200, likeDocument, "comment Liked Successfully"));
      } catch (error) {
        res.status(500).send(`Internal Server Error : ${error}`);
      }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const { tweetId } = req.params;
        if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid commentId");
        const LikedTweet = await tweetModel.findById(tweetId);
        if (!LikedTweet)
          throw new ApiError(404, "tweet not found : tweet source not found");
        
        const Alreadyliked = await LikeModel.findOne({
            tweet: LikedTweet?._id,
            likedBy: req.user?._id,
        });
        
        if(Alreadyliked) {
            await Alreadyliked.deleteOne();
            return res.status(200).json(new ApiResponse(200, Alreadyliked, "Unlike successfully"))
        }
    
        const likeDocument = await LikeModel.create({
            tweet: LikedTweet?._id,
            likedBy: req.user?._id,
        });
        if (!likeDocument) throw new ApiError(400, "Failed to like the comment");
        return res
          .status(200)
          .json(new ApiResponse(200, likeDocument, "Tweet Liked Successfully"));
      } catch (error) {
        res.status(500).send(`Internal Server Error : ${error}`);
      }
});

const getLikedVideos = asyncHandler(async (req, res) => {
   try {
      const userId = req.user?._id;
      if(!isValidObjectId(userId)) throw new ApiError(400, "unauthorized user");
      const LikedVideos = await LikeModel.find({
        $and: [ { likedBy: userId }, { video: { $exists: true } } ]
      });
      if(!LikedVideos) {
        throw new ApiError(404, "No liked video found");
      }
      return res.status(200).json(new ApiResponse(200, ))
   } catch (error) {
    res.status(500).send(`Internal server Error : ${error}`)
   }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
