import Joi from 'joi';

function bootCollectValidator(): Joi.ObjectSchema {
  return Joi.object().keys({
    updatedUserWallet : Joi.number().greater(0).required(),
    bv: Joi.number().greater(-1).required(),
    tbv: Joi.number().greater(-1).required(),
    collectBootValueSIArray : Joi.array().required(),
    tableId : Joi.string().required(),
  });
}

const exportObject = {
  bootCollectValidator
};
export = exportObject;
