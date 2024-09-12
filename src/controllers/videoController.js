import mongoose, { isValidObjectId } from "mongoose";
import videoModel from "../models/videoModel.js";
import { userModel } from "../models/userModel.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const Videos = await videoModel.find();
    if (!Videos || Videos.length === 0) {
      throw new ApiError(404, "Videos Not found");
    }
    console.log(Videos.length);
    res.status(200).json(new ApiResponse(200, "Videos found"));
  } catch (error) {
    res.send(`Internal server Error : ${error}`);
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;
    let videoFileLocalPath = req.files?.videoFile[0]?.path;
    let thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoFileLocalPath || !thumbnailLocalPath) {
      throw new ApiError(400, "file Localpath is worng");
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile || !thumbnail) {
      throw new ApiError(500, "having Truble while uploading files");
    }

    const uploadedVideo = await videoModel.create({
      title,
      description,
      videoFile: videoFile.url,
      thumbnail: thumbnail.url,
      duration: videoFile.duration,
      owner: req.user?._id,
    });
    if (!updateVideo) {
      throw new ApiError(500, "Failed to Upload files : Try Again later");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, uploadedVideo, "video Uploaded Successfully"));
  } catch (error) {
    res.send(`internal Server Error : ${error}`);
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
