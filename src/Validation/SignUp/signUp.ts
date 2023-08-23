import Joi from 'joi';
import { SignUpInterface } from '../../Interface/SignUp/SignUpInterface';

const SignUpValidation = async (Data: SignUpInterface) => {

    return Joi.object({

        userId: Joi.string().min(1).required(),
        userName: Joi.string().min(1).required(),
        userProfile: Joi.string().required(),
        mobileNumber: Joi.string().required(),
        chips: Joi.number().strict().required(),
        token: Joi.string().required(),
        bootValue: Joi.number().strict().required(),
        playerCount: Joi.number().strict().required(),
        isBot: Joi.boolean().required(),

    }).validate(Data).error?.details[0]?.message;

};

export { SignUpValidation };