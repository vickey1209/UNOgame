import Joi from 'joi';
import { ThrowCardInterface } from '../../Interface/ThrowCard/ThrowCardInterface';

const ThrowCardValidation = async (Data: ThrowCardInterface) => {

    return Joi.object({

        card: Joi.string().min(1).required(),
        cardType: Joi.string().min(1).required(),
        cardColor: Joi.string().min(1).required(),
        cardIndex: Joi.number().strict().required(),

        userId: Joi.string().min(1),
        tableId: Joi.string().min(1),
        seatIndex: Joi.number().strict(),

    }).validate(Data).error?.details[0]?.message;

};

export { ThrowCardValidation };