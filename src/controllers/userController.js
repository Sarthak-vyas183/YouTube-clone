import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { userModel } from "../models/userModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user detail from frontend
  // check validation that all fields are not empty
  //check if user is already exist : username , email etc
  //check for image and check for avatar
  //upload them to the cloudinary
  // create user objects - create entry in db
  //remove password and refresh token field from the response
  //check user creation
  // send response
  const { email, fullName, password, username } = req.body;
  if (
    [email, fullName, password, username].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are require");
  }

  const existUser = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (existUser) {
    throw new ApiError(409, "username and with  user already exist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0].path

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file require");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(409, "username and with with user already exist");
  }

  const user = await userModel.create({
    fullName,
    email,
    password,
    username,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });
  const createdUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registring user");
  } 
  

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    createdUser._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(201)
    //.cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: createdUser,
          accessToken,
          refreshToken,
        },
        "Registration success"
      )
    );});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    return res.status(404).send("Invalid credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid) {
    return res.status(400).send("Invalid credentials")
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await userModel
    .findById(user._id)
    .select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    //.cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Login Success"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await userModel.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await userModel.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldpassword, newpassword } = req.body;

    const user = await userModel.findById(req.user._id);

    if (!user) {
      throw new ApiError("400", "user not found");
    }
    const isPasswordvalid = user.isPasswordCorrect(oldpassword);

    if (!isPasswordvalid) {
      throw new ApiError(401, "Invalid oldpassword");
    }
    user.password = newpassword;
    await user.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "password change successfully !"));
  } catch (error) {
    throw new ApiError(400, `something went wrong : ${error}`);
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  try {
    const { username, fullName, email } = req.body;
    if ([username, fullName, email].some((field) => field?.trim() === "")) {
      return new ApiError(
        401,
        "email , fullName , and email all fields are require"
      );
    }
    const user = await userModel
      .findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            fullName,
            email,
            username,
          },
        },
        { new: true }
      )
      .select("-password -refreshToken");
    await user.save();
    res
      .status(200)
      .json(new ApiResponse(200, user, "Account DetailUpdated Successfully"));
  } catch (error) {
    throw new ApiError(500, `Internal Server Error : ${error}`);
  }
});

const updateAvatar = asyncHandler(async (req, res) => {
  try {
    //uplading file from local to clodinary and get URL
    const AvatarLocalPath = req.file?.path;
    if (!AvatarLocalPath) return new ApiError(401, "Avatar file missing");
    const avatar = await uploadOnCloudinary(AvatarLocalPath);
    if (!avatar.url)
      return new ApiError(401, "Error while uploading Avatar on cludinary");

    // update URL on database
    // geting loggedin userdata through req.user
    const user = await userModel
      .findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            avatar: avatar.url,
          },
        },
        { new: true }
      )
      .select("-password -refreshToken");
    if (!user) return new ApiError(501, "avatar updation in database failed !");
    res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar upadated successfully"));
  } catch (error) {
    throw new ApiError(500, `Internal server error : ${error}`);
  }
});

const coverImageUpdate = asyncHandler(async (req, res) => {
  try {
    //uplading file from local to clodinary and get URL
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) return new ApiError(401, "coverImage file missing");
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url)
      return new ApiError(401, "Error while uploading Avatar on cludinary");

    // update URL on database
    // geting loggedin userdata through req.user
    const user = await userModel
      .findByIdAndUpdate(
        req.user?._id,
        {
          $set: {
            coverImage: coverImage.url,
          },
        },
        { new: true }
      )
      .select("-password -refreshToken");
    if (!user) return new ApiError(501, "coverImage updation in database failed !");
    res
      .status(200)
      .json(new ApiResponse(200, user, "coverImage upadated successfully"));
  } catch (error) {
    throw new ApiError(500, `Internal server error : ${error}`);
  }
});

const userChannelProfile = asyncHandler(async(req , res)=> {
   try {
     const {username}  = req.params;
     if(!username?.trim()) return new ApiError(400 , "username missing");
    const channel = await userModel.aggregate([ 
     { 
           $match : {
             username : username
           }
     },
           {
             $lookup : {
               from : "subscriptions",
               localField : "_id",
               foreignField : "channel",
               as : "subscribers"
             }
           } ,
 
           {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedTo"
            } 
           },
       
           {
             $addFields : {
               subscriberCount : {
                  $size : "$subscribers"
               },
               subscribedToCount : {
                 $size : "$subscribedTo"
               },

               isSubscribed : {
                $cond : {
                  if : {$in : [req.user?._id , "$subscribers.subscriber"]},
                  then : true,
                  else : false
                }
            }

             },
 
             
           },  
 
 
           {
             $project : {
               fullName : 1,
               email : 1,
               username : 1,
               avatar : 1,
               coverImage : 1,
               subscriberCount : 1,
               subscribedToCount : 1,
               isSubscribed : 1,
             }
           }
     ]) 
     if(!channel?.length) {
      res.status(404).json({msg : "channel does not found"})
     } 
     
     return res.status(200)
               .json(
                  new ApiResponse(200, channel[0], "User Channel found")
               )   
 
   } catch (error) {
    res.send(`Internal server Error : ${error}`)
   }
})

const getWatchHistory = asyncHandler(async(req , res) => {
    try {
       const user = await userModel.aggregate([
            {
              $match : {
                 _id : new mongoose.Types.ObjectId(req.user._id)
              }
            },
             {
               $lookup : {
                 from : "videos",
                 localField : "watchHistory",
                 foreignField : "_id",
                 as : "watchHistory",
                 pipeline : [
                      {
                        $lookup : {
                          from : "users",
                          localField : "owner",
                          foreignField : "_id",
                          as : "owner",
                          pipeline : [
                            {
                               $project : {
                                fullName : 1,
                                email : 1,
                                username : 1,
                                avatar : 1,
                                coverImage : 1,
  
                               }
                            }
                          ]
                        } 
                      } , 
  
                     {
                      $addFields : {
                        owner : {
                            $first : "$owner"
                        }
                      }
                     }
                 ]
               }
  
             }
       ]);
  
       if(!user) { 
         throw new ApiError(404 , "user not found in watch history")
       }
  
       return res
       .status(200)
       .json(
           new ApiResponse(
               200,
               user[0].watchHistory,
               "Watch history fetched successfully"
           )
       )    } catch (error) {
      res.send(`Internal server error : ${error}`)
    }
})

const SendLoggedUserData = asyncHandler(async(req, res)=> {
   try {
     res.send(req.user)
   } catch (error) {
    res.status(404).send(error)
   }
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateAvatar,
  coverImageUpdate,
  userChannelProfile,
  getWatchHistory,
  SendLoggedUserData
};
