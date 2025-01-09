import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import commentModel from "../models/commentModel.js";

const getVideoComments = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    // Check if the provided videoId is valid
    if (!isValidObjectId(videoId)) {
      throw new ApiError(405, "Invalid videoId");
    }

    // Convert videoId to ObjectId using 'new'
    const videoObjectId = new mongoose.Types.ObjectId(videoId);

    // Fetch comments for the video
    const comments = await commentModel.aggregate([
      {
        $match: {
          video: videoObjectId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetail",
        },
      },
      {
        $project: {
          "ownerDetail.password": 0, // Exclude password
          "ownerDetail.watchHistory": 0, // Exclude watchHistory
          "ownerDetail.refreshToken": 0, // Exclude refreshToken
        },
      },
    ]);

    // Check if comments exist
    if (!comments || comments.length < 1) {
       res.status(404).send("No comments found on the video")
    }

    // Return the fetched comments
    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched successfully"));
  } catch (error) {
    res.status(500).send(`Internal server error: ${error}`);
  }
});

// Add comment on a Particular video
const addComment = asyncHandler(async (req, res) => {
  try {
    const comment = await commentModel.create({
      content: req.body.content,
      video: req.params.videoId,
      owner: req.user?._id,
    });
    if (!comment) throw new ApiError(405, "failed to comment on Video");
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment Success"));
  } catch (error) {
    res.send(`Internal server Error : ${error}`);
  }
});

// update comment
const updateComment = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    if (content?.trim() === "") {
      throw new ApiError(404, "content is content is Require to Update");
    }
    const comment = await commentModel.findOneAndUpdate(
      {
        _id: req.params.commentId,
        owner: req.user?._id,
      },
      {
        content,
      }
    );
    if (!comment) throw new ApiError(404, "failed to update comment");
    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment updated"));
  } catch (error) {
    res.status(500).send(`Internal server Error : ${error}`);
  }
});

// delete comment
const deleteComment = asyncHandler(async (req, res) => {
  try {
    const deleted_comment = await commentModel.findOneAndDelete({
      _id: req.params.commentId,
      owner: req.user?._id,
    });
    if (!deleted_comment) throw new ApiError(404, "failed to delete comment");
    return res
      .status(200)
      .json(new ApiResponse(200, deleted_comment, "comment updated"));
  } catch (error) {
    res.status(500).send(`Internal server Error : ${error}`);
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
