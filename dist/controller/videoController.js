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
exports.GetUserVideosController = exports.GetVideoUploadingUrlController = void 0;
const videoService_1 = require("../service/videoService");
const GetVideoUploadingUrlController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, videoService_1.GetVideoUploadingSigneddUrl)(req.params.title, req.params.ext, req.body.userId);
    res.status(200).send({
        url: result
    });
});
exports.GetVideoUploadingUrlController = GetVideoUploadingUrlController;
const GetUserVideosController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, videoService_1.GetUserVideos)(req.body.userId);
    res.status(200).send({
        videos: result
    });
});
exports.GetUserVideosController = GetUserVideosController;
//# sourceMappingURL=videoController.js.map