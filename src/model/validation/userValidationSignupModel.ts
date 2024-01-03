import Joi from "joi";

export const UserValidationSignupModel = Joi.object({
    email:Joi.string().required(),
    password:Joi.string().required(),
    userName:Joi.string().required()
})