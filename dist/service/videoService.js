"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserVideos = exports.GetVideoUploadingSigneddUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const videoModel_1 = require("../model/videoModel");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const s3Client = new client_s3_1.S3Client({
    region: `${process.env.MY_AWS_REGION}`,
    credentials: {
        accessKeyId: `${process.env.MY_AWS_ACCESS_ID}`,
        secretAccessKey: `${process.env.MY_AWS_SECRET_ACCESS_KEY}`,
    },
});
const GetVideoUploadingSigneddUrl = (vid_title, vid_ext, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const videoObj = yield videoModel_1.VideoModel.create({
        videoName: vid_title,
        belongsTo: userId,
        ext: vid_ext,
    });
    const command = new client_s3_1.PutObjectCommand({
        Bucket: "transcoder-proj-bucket",
        Key: `temp/${videoObj._id}.${vid_ext}`,
        ContentType: `video/${vid_ext}`,
    });
    return yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command);
});
exports.GetVideoUploadingSigneddUrl = GetVideoUploadingSigneddUrl;
const GetUserVideos = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const videos = [];
    const userVideos = yield videoModel_1.VideoModel.find({
        belongsTo: userId,
    });
    yield Promise.all(userVideos.map((video) => __awaiter(void 0, void 0, void 0, function* () {
        const processedVideo = yield GetVideoPresignedUrls(video);
        if (processedVideo)
            videos.push(processedVideo);
    })));
    return videos;
});
exports.GetUserVideos = GetUserVideos;
const GetVideoPresignedUrls = (video) => __awaiter(void 0, void 0, void 0, function* () {
    let videoResolutions = [];
    yield Promise.all(video.resolutions.map((resolution) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("key : ", `${resolution.resolution}/${video.videoName}.${video.ext}`);
        const command = new client_s3_1.GetObjectCommand({
            Bucket: "transcoder-proj-bucket",
            Key: `${resolution.resolution}/${video._id}.${video.ext}`,
        });
        const resolutionUrl = yield (0, s3_request_presigner_1.getSignedUrl)(s3Client, command);
        const processedResolution = {
            resolution: resolution.resolution,
            url: resolutionUrl,
            status: resolution.status,
        };
        videoResolutions.push(processedResolution);
    })));
    console.log("done", videoResolutions);
    video.resolutions = videoResolutions;
    return video;
});
function generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substr(2, 5);
    return `${timestamp}${randomString}`;
}
//# sourceMappingURL=videoService.js.map