import { ApiError } from "../utils/Apierror.js";

import { userModel } from "../models/userModel.js";
import { Subscription } from "../models/subscription.Model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isValidObjectId } from "mongoose";

// const getSubscribedChannels = async(req, res) => {
//     try {
//        const userId = req.user._id;
//       const channels = await subscriptionModel.aggregate([
//           {
//             $match : {
//                 subscriber : userId
//             }
//           },
//           {
//              $lookup : {
//                 from : "users",
//                 localField : "channel",
//                 foreignField : "_id",
//                 as : "channels"
//              }
//           },
//            {
//             $addFields : {
//                channelDetail : "$channels"
//             }
//            }
//       ])
//     } catch (error) {
//        res.send(`Internal Error : ${error}`);
//     }
// }

//controller return channel list which user have subscribed !
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const subscriberId = req.user?._id;
  console.log(subscriberId);
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(404, "Invalid subscriber ID");
  }

  const user = await userModel.findById(subscriberId);
  if (!user) {
    throw new ApiError(404, "user Not found");
  }
  const channels = await Subscription.find({
    subscriber: subscriberId,
  });
  console.log(channels);
  if (!channels || channels.length < 1) {
    throw new ApiError(400, "No subscribed channel found !");
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { channels },
        "Subscribed channels are fetched successfully"
      )
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log(channelId);
  if (!isValidObjectId(channelId)) {
    throw new ApiError(404, "Invalid channel Id");
  }
  const user = await userModel.findOne({ username: channelId });
  if (!user) {
    throw new ApiError(400, "user not found");
  }
  const subscribers = await Subscription.find({
    channel: user?._id,
  });
  if (!subscribers) {
    throw new ApiError(404, "no subscriber found");
  }
  const subscriberCound = subscribers.length;
  res
    .status(200)
    .json(
      new ApiResponse(200, subscriberCound, "subscriberCound Fetched success")
    );
});

const toggleSubscription = asyncHandler(async (req, res) => {
  const channelId = req.params.toggleSubscription;

  // TODO: toggle subscription
  const subscriberId = req.user._id;

  // Validate channel ID and subscriber ID
  if (!isValidObjectId(channelId) || !isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid channel or subscriber ID");
  }

  // Ensure the user is not subscribing to their own channel
  if (subscriberId.toString() === channelId) {
    throw new ApiError(400, "You cannot subscribe to your own channel");
  }

  // Check if the channel exists
  const channel = await userModel.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  // Check if there is an existing subscription
  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (existingSubscription) {
    // Unsubscribe (remove subscription)
    await existingSubscription.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Unsubscribed successfully"));
  } else {
    // Subscribe (create new subscription)
    const newSubscription = new Subscription({
      subscriber: subscriberId,
      channel: channelId,
    });

    await newSubscription.save();
    return res
      .status(200)
      .json(new ApiResponse(200, newSubscription, "Subscribed successfully"));
  }
});

export { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription };
