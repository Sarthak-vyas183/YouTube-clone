import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscriptionController.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/c/:channelId")
    .get(getSubscribedChannels)
    .post(toggleSubscription);

router.route("/getUserChannelSubscribers").get(verifyJWT, getUserChannelSubscribers);
router.route("/getSubscribedChannels").get(verifyJWT, getSubscribedChannels);
router.route("/:toggleSubscription").get(verifyJWT, toggleSubscription)

export default router