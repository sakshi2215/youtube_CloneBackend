import { Router} from "express"
import { registerUser } from "../controllers/user.controller.js"
import {upload}from "../middlewares/multer.middleware.js"
const router = Router()

router.route("/register").post(
    upload.feild([
        {
            name: "avatar",
            maxCount:1,
        },
        {
            name: "coverImage",
            maxCount:1,        },
    ]),
    registerUser)

// router.route("/login").post(loginUser)
export default router