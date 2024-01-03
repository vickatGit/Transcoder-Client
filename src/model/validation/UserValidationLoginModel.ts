import Joi from "joi";

export const UserValidationLoginModel = Joi.object({
    email:Joi.string().required(),
    password:Joi.string().required()
})