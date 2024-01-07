"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const userModel_1 = require("../model/userModel");
const bcrypt = __importStar(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const signup = (userName, email, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.UserModel.findOne({ email: email });
    if (!user) {
        const hashedPassword = yield bcrypt.hash(password, 10);
        yield userModel_1.UserModel.create({
            userName: userName,
            email: email,
            password: hashedPassword
        });
    }
    else {
        res.status(409);
        throw new Error("User Already Exist Try Login");
    }
});
exports.signup = signup;
const login = (email, password, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield userModel_1.UserModel.findOne({ email: email });
    if (user) {
        const ispasswordMatched = yield bcrypt.compare(password, user.password);
        if (ispasswordMatched) {
            const token = yield jsonwebtoken_1.default.sign({ email: email, userId: user._id }, `${process.env.JWT_AUTH_SECRET_KEY}`, { expiresIn: '40d' });
            return { token: token };
        }
        else {
            res.status(400);
            throw new Error("Invalid Credentials");
        }
    }
    else {
        res.status(409);
        throw new Error("No User Found Try Signing up");
    }
});
exports.login = login;
//# sourceMappingURL=AuthService.js.map