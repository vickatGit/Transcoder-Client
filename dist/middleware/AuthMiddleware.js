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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authvalidator = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const authvalidator = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let authToken = req.headers.authorization || req.headers.authorization;
    console.log("token", authToken);
    if (authToken) {
        authToken = authToken.split(" ")[1];
        jsonwebtoken_1.default.verify(authToken, `${process.env.JWT_AUTH_SECRET_KEY}`, (err, decoded) => {
            if (err) {
                res.status(400).send({
                    msg: "Unauthorised"
                });
            }
            else {
                console.log("user ", decoded);
            }
            req.body.userId = decoded.userId;
        });
    }
    else {
        res.status(400).send({
            msg: "No Token Provided"
        });
    }
    next();
});
exports.authvalidator = authvalidator;
//# sourceMappingURL=AuthMiddleware.js.map