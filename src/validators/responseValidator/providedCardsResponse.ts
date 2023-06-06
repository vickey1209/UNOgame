import Joi from 'joi';

function providedCardsValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    cards : Joi.array().required(),
    movedCard : Joi.array().required(),
    extraCard : Joi.array().required(),
    turnCard : Joi.array().required(),
    tableId: Joi.string().required(),
  });
}

const exportObject = {
  providedCardsValidator
};
export = exportObject;
