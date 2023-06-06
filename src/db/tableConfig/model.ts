import { json } from 'express';
import Joi from 'joi';
const JoiObjectId = require('joi-oid');
class TableConfiguration {
  joiSchema() {
    return Joi.object().keys({
      _id: Joi.string().required(),
      gameType: Joi.string().required(),
      currentRound: Joi.number().required(),
      lobbyId: Joi.string().required(),
      gameId : Joi.string().required(),
      minPlayer: Joi.number().required(),
      noOfPlayer: Joi.number().required(),
      gameStartTimer: Joi.number().required(),
      userTurnTimer: Joi.number().required(),
      entryFee: Joi.number().required(),
      moneyMode : Joi.string().required(),
      scriptUser : Joi.boolean().required(),
      totalTurnTime : Joi.number().required(),
      rejoinTime : Joi.number().required(),
      isRobot : Joi.boolean().required(),
      robotType : Joi.string().required(),
      createdAt: Joi.string().required(),
      updatedAt: Joi.string().required(),
    });
  }
}
export = TableConfiguration;