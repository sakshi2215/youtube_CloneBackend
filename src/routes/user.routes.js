import { Router} from "express"
import { registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getuserChannelProfile,
    getWatchHistory } from "../controllers/user.controller.js"
    
import {upload}from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1,               //MIDDLEWARE
        },
        {
            name: "coverImage",
            maxCount:1,        },
    ]),
    registerUser)


router.route("/login").post(loginUser)

router.route("/refresh-token").post(refreshAccessToken)

//secured routes
router.route("/logout").post(verifyJWT,logoutUser)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)

router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)

router.route("/channel-profile").get(verifyJWT, getuserChannelProfile)

router.route("/watch-history").get(verifyJWT, getWatchHistory)

export default router