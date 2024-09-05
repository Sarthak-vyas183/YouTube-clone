import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import {userModel} from "../models/userModel.js"; 
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler( async(req , res) => {
    // get user detail from frontend
    // check validation that all fields are not empty
    //check if user is already exist : username , email etc
    //check for image and check for avatar 
    //upload them to the cloudinary
    // create user objects - create entry in db
    //remove password and refresh token field from the response
    //check user creation 
    // send response
   const {email , fullName , password , username , } =  req.body;

     if(
        [email , fullName , password , username].some(
            (fields) => fields?.trim() === ""
        )
     ) {
        throw new ApiError(400 , "All fields are require");
     }  

     const existUser = userModel.findOne({
          $or : [{username} , {email}]
     }) 

      if(existUser) {
        throw new ApiError(409 , "username and with with user already exist")
      } 
      const avatarLocalPath = req.files?.avatar[0]?.path
      const coverImageLocalPath = req.files?.coverImage[0].path 
      if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar file require")
      }
      const avatar =  await uploadOnCloudinary(avatarLocalPath);
      const coverImage = await uploadOnCloudinary(coverImageLocalPath);

      if(!avatar) { 
        throw new ApiError(409 , "username and with with user already exist")
      }

      const user = await userModel.create({
         fullName,
         email,
         password,
         username,
         avatar : avatar.url,
         coverImage : coverImage?.url || "",
      }) 
       createdUser = await userModel.findById(user._id).select("-password -refreshToken");

       if(!createdUser) {
         throw new ApiError(500 , "something went wrong while registring user")
       } 
       return res.status(201).json(
          new ApiResponse(200 , createdUser , "User Register Successfully")
       )
    
} )

 export {registerUser};