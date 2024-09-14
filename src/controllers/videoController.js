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
 try {
    const {videoId} = req.params;
    const video = await videoModel.findById(videoId);
    if(!video) {
        throw new ApiError(401 , "video not found");
    } 
    return res.status(200).json(new ApiResponse(200 , video , "video found"));

 } catch (error) {
    res.status(500).send(`Internal server Error : ${error}`)
 }
});

const updateVideo = asyncHandler(async (req, res) => {
 try {
     const { videoId } = req.params;
     const { title , description} = req.body;
     console.log(req.file.path)
   
     if([title , description].some((field) => {
           !field?.trim() === ""
     } )) { 
       throw new ApiError(404 , "All fields are Require")
     } 
    
     
     let thumbnailLocalPath = req.file.path;
     
      if(!thumbnailLocalPath) {
        throw new ApiError(404 , "Invalid file path");
      } 
      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      if(!thumbnail) throw new ApiError(500, "failed to upload on cludinary");
       
     const updatedVideo = await videoModel.findByIdAndUpdate(videoId , {
               title,
               description,
               thumbnail : thumbnail.url
     });
     if(!updatedVideo) {
       throw new ApiError(400 , "failed to upload");
     } 
     return res.status(200).json(new ApiResponse(200 , updatedVideo , "video Updated successfully !"))
   
 } catch (error) {
   res.send(`Internal server Error : ${error}`) 
 }
}); 


const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await videoModel.findByIdAndDelete(videoId);
      if(!video) {
         throw new ApiError(400, "failed to delete video");
      } 
      return res.status(200).json(new ApiResponse(200 , {} , "video deleted !"));
  } catch (error) {
     res.send(`Internal server Error : ${error}`)
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await videoModel.findById(videoId);
  if(!video) throw new ApiError(400 , "video not found");
  if(!video.isPublished) throw new ApiResponse(200 , {} , "video is not publish yet")
  
 return res.status(200).json(new ApiResponse(200 , {} , "video is Published"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
