import mongoose, { isValidObjectId } from "mongoose"
import {tweetModel} from "../models/tweetModel.js"
import {userModel} from "../models/userModel.js"
import {ApiError} from "../utils/Apierror.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(content?.trim() === "") {
         throw new ApiError(404, "content is Require");
    }
    const owner = req.user?._id;
    const tweet = await tweetModel.create({
         content,
         owner,
    });
    if(!tweet) {
        throw new ApiError(400, "Failed to Create tweet")
    }
    return res.status(200).json(new ApiResponse(200, tweet , "tweet Success"));
})

const getUserTweets = asyncHandler(async (req, res) => {
     const username = req.params.userId;
     console.log(username)
     const user = await userModel.findOne({username});
     if(!user) throw new ApiError(404,"Invalid Username")
      const tweets = await tweetModel.find({owner : user._id});
    if(!tweets) {
        throw new ApiResponse(200,{},"not tweets found")
    } 
    return res.status(200).json(new ApiResponse(200, tweets, "tweets"));
})

const updateTweet = asyncHandler(async (req, res) => {
    try {
         const tweetId = req.params.tweetId;
         const updatedTweet = await tweetModel.findOneAndUpdate({
               _id : tweetId,
               owner : req.user?._id
         },{
             content : req.body.content 
         });
         if(!updatedTweet) {
             throw ApiError(400, "Failed to Update tweet")
         } 
         return res.status(200).json(new ApiResponse(200, updatedTweet ,"updated successfully"))
    
    } catch (error) {
        res.send(`Internal server Error : ${error}`)
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    try {
        const tweetId = req.params.tweetId;
        const DeletedTweet = await tweetModel.findOneAndDelete({
              _id : tweetId,
              owner : req.user?._id
        });
        if(!DeletedTweet) {
            throw ApiError(400, "Failed to Delete tweet")
        } 
        return res.status(200).json(new ApiResponse(200, DeletedTweet ,"Deletion successfully"))
   
   } catch (error) {
       res.send(`Internal server Error : ${error}`)
   }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
