"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const VideoResolutionModel = {
    resolution: String,
    url: String,
    status: String
};
exports.VideoModel = mongoose_1.default.model("VideoModel", new mongoose_1.default.Schema({
    videoName: { type: String, required: true },
    resolutions: { type: [VideoResolutionModel] },
    belongsTo: { type: mongoose_1.default.Types.ObjectId, ref: 'UserModel', required: true },
    ext: { type: String, required: true }
}));
//# sourceMappingURL=videoModel.js.map