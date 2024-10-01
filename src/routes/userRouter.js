import { Router } from "express";
const router = Router();
import {
  loginUser,
  registerUser,
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
} from "../controllers/userController.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secure route
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/changepassword").post(verifyJWT, changeCurrentPassword);
router.route("/getcurrentUser").post(verifyJWT, getCurrentUser);
router.route("/updateAccountDetail").patch(verifyJWT, updateAccountDetail);
router
  .route("/updateAvatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/updateCoverImage")
  .patch(verifyJWT, upload.single("coverImage"), coverImageUpdate);
router.route("/channel/:username").get(verifyJWT, userChannelProfile);
router.route("/getWatchHistory").post(verifyJWT, getWatchHistory);
router.route("/verifyUserToken").post(verifyJWT, SendLoggedUserData);

export default router;
