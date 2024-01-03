import { Router } from "express";

import {GetVideoUploadingUrlController,GetUserVideosController} from '../controller/videoController'
import {loginController,signupController} from '../controller/authController'
import { authvalidator} from '../middleware/AuthMiddleware'

const router = Router()
router.route("/login").post(loginController)
router.route("/signup").post(signupController)

router.use(authvalidator)

router.route("/upload_video_url/:title/:ext").get(GetVideoUploadingUrlController)
router.route("/get_videos").get(GetUserVideosController)


export default router