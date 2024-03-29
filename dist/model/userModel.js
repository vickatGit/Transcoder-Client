"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.UserModel = mongoose_1.default.model("UserModel", new mongoose_1.default.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    userName: { type: String },
}));
//# sourceMappingURL=userModel.js.map