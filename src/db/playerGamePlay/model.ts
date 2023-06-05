import Joi from 'joi';
const JoiObjectId = require('joi-oid');

class PlayerGamePlay {
  joiSchema() {
    return Joi.object().keys({
      _id: JoiObjectId.string(),
      userId : Joi.string().required(),
      userName : Joi.string().allow('').required(),
      profilePic : Joi.string().required(),
      seatIndex : Joi.number().required(),
      isRobot : Joi.boolean().required(),
      timeOutCounter : Joi.number().required(),
      ScriptUser :  Joi.boolean().required(),
      points: Joi.number().required(),
      userStatus: Joi.string().required(),
      card: Joi.array(),
      createdAt: Joi.string().required(),
      updatedAt: Joi.string().required(),
    });
  }
}
export = PlayerGamePlay;
