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
exports.signupController = exports.loginController = void 0;
const AuthService_1 = require("../service/AuthService");
const UserValidationLoginModel_1 = require("../model/validation/UserValidationLoginModel");
const userValidationSignupModel_1 = require("../model/validation/userValidationSignupModel");
const loginController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = UserValidationLoginModel_1.UserValidationLoginModel.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).send({
            errors: error
        });
    }
    try {
        const data = yield (0, AuthService_1.login)(req.body.email, req.body.password, res);
        res.status(200).send({
            data: data
        });
    }
    catch (error) {
        console.log("login error", error);
    }
});
exports.loginController = loginController;
const signupController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = userValidationSignupModel_1.UserValidationSignupModel.validate(req.body, { abortEarly: false });
    if (error) {
        res.status(400).send({
            errors: error
        });
    }
    try {
        const data = yield (0, AuthService_1.signup)(req.body.userName, req.body.email, req.body.password, res);
        res.status(200).send({
            data: data
        });
    }
    catch (error) {
        console.log("signup error", error);
    }
});
exports.signupController = signupController;
//# sourceMappingURL=authController.js.map