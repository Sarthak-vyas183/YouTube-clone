import mongoose, { isValidObjectId } from "mongoose";
import { PlaylistModel } from "../models/playlistModel.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import videoModel from "../models/videoModel.js";

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;
    if ([name, description].some((field) => field?.trim() === "")) {
      throw new ApiError(404, "All fields are require");
    }
    const createPlaylist = await PlaylistModel.create({
      name,
      description,
      owner: req.user?._id,
    });
    if (!createPlaylist) {
      throw new ApiError(400, "Failed to create playlist");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, createPlaylist, "playlist created"));
  } catch (error) {
    res.status(500).send(`Internal Server Error ${error}`);
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) throw new ApiError(401, "Invalid user");

    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    const getPlaylist = await PlaylistModel.find({ owner: objectIdUserId });
    if (!getPlaylist) throw new ApiError(401, "Unable to get playlists");

    return res
      .status(200)
      .json(new ApiResponse(200, getPlaylist, "Playlist fetched"));
  } catch (error) {
    res.status(500).send(`Internal server Error : ${error}`);
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId))
      throw new ApiError(401, "Invalid playlistID");

    const objectIdPlaylistId = new mongoose.Types.ObjectId(playlistId);

    // const getPlaylist = await PlaylistModel.findById(objectIdPlaylistId);
    const getPlaylist = await PlaylistModel.aggregate([
      {
        $match: {
          _id: objectIdPlaylistId,
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
        $addFields: {
          ownerDetail: "$ownerDetail",
        },
      },
      {
        $project: {
          "ownerDetail.password": 0,
          "ownerDetail.accessToken": 0,
          "ownerDetail.refreshToken": 0,
          "ownerDetail.watchHistory": 0,
        },
      },
    ]);

    if (!getPlaylist) throw new ApiError(401, "Unable to get playlists");

    return res
      .status(200)
      .json(new ApiResponse(200, getPlaylist, "Playlist fetched"));
  } catch (error) {
    res.status(500).send(`Internal server error : ${error}`);
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    if ([playlistId, videoId].some((field) => !isValidObjectId(field))) {
      throw new ApiError(400, "Invalid url of video or playlist");
    }

    const verifyVideoId = await videoModel.findById(videoId);
    if (!verifyVideoId) {
      throw new ApiError(404, "video not found");
    }
    const FindVideoInPlaylist = await PlaylistModel.findOne({
      _id: playlistId,
      videos: videoId,
    });

    if (FindVideoInPlaylist) {
      throw new ApiError(400, "video Already Exist");
    }

    const AddvideoToPlaylist = await PlaylistModel.findOneAndUpdate(
      { _id: playlistId },
      { $push: { videos: videoId } },
      { new: true }
    );
    if (!AddvideoToPlaylist) {
      throw new ApiError(404, "Failed to Add video");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, AddvideoToPlaylist, "Video Added Successfully")
      );
  } catch (error) {
    res.status(500).send(`Internal server error : ${error}`);
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId, videoId } = req.params;
    if ([playlistId, videoId].some((field) => !isValidObjectId(field))) {
      throw new ApiError(400, "Invalid url of video or playlist");
    }

    const verifyVideoId = await videoModel.findById(videoId);
    if (!verifyVideoId) {
      throw new ApiError(404, "video not found");
    }

    const RemovevideoToPlaylist = await PlaylistModel.findOneAndUpdate(
      { _id: playlistId },
      { $pull: { videos: videoId } },
      { new: true }
    );
    if (!RemovevideoToPlaylist) {
      throw new ApiError(404, "Failed to Add video");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          RemovevideoToPlaylist,
          "Video removed Successfully"
        )
      );
  } catch (error) {
    res.status(500).send(`Internal server error : ${error}`);
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await PlaylistModel.findOneAndDelete({ _id: playlistId });

    if (!playlist) throw new ApiError(404, "failed palylist to delete");

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "palylist Deleted Success"));
  } catch (error) {
    res.status(500).send(`Failed to Delete a Playlist ${error}`);
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if ([name, description].some((field) => !field?.trim())) {
    return res.status(400).send("All fields are required");
  }

  if (!isValidObjectId(playlistId))
    return res.send("Invalid Format of playlistId");

  const updatedPlaylist = await PlaylistModel.findOneAndUpdate(
    { _id: playlistId },
    {
      name,
      description,
    }
  );
  if (!updatedPlaylist) return res.send("Failed to update Playlist Detail");

  return res
    .status(200)
    .send(`playList detail updated success ${updatedPlaylist}`);
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
