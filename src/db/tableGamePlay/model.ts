import Joi from 'joi';
const JoiObjectId = require('joi-oid');

class TableGamePlay {

  joiSchema() {
    return Joi.object().keys({
      _id: Joi.string().required(),
      movedCard : Joi.array().items(Joi.string()).default([]).required(),
      extraCard : Joi.array().items(Joi.string()).default([]).required(),
      turnCard : Joi.array().items(Joi.string()).default([]).required(),
      seats: Joi.array(),
      // seats: Joi.array().items({
      //   userId: Joi.string().required(),
      //   si: Joi.number().required(),
      //   name :Joi.string().required(),
      //   pp:Joi.string().required(),
      //   rejoin : Joi.boolean(),
      //   userState: Joi.string().required()
      // }).default([]).required(),
      cardColor : Joi.string().allow("").required(),
      cardNumber : Joi.number().required(),
      cardTurnCircle: Joi.string().allow("").required(),
      cardDrawCounter: Joi.number().required(),
      currentTurnUserId : Joi.string().allow("").required(),
      playingUserCounter : Joi.number().required(),
      tableStatus :  Joi.string().required(),
      DCSend :  Joi.boolean().required(),
      currentTurnSeatIndex: Joi.number().required(),
      paneltyID : Joi.string().allow("").required(),
      oldPaneltyID : Joi.string().allow("").required(),
      paneltyTurn :  Joi.number().required(),
      createdAt: Joi.string().required(),
      updatedAt: Joi.string().required(),
    });
  }
}
export = TableGamePlay;
