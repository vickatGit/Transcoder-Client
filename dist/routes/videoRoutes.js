"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const videoController_1 = require("../controller/videoController");
const authController_1 = require("../controller/authController");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = (0, express_1.Router)();
router.route("/login").post(authController_1.loginController);
router.route("/signup").post(authController_1.signupController);
router.use(AuthMiddleware_1.authvalidator);
router.route("/upload_video_url/:title/:ext").get(videoController_1.GetVideoUploadingUrlController);
router.route("/get_videos").get(videoController_1.GetUserVideosController);
exports.default = router;
//# sourceMappingURL=videoRoutes.js.map