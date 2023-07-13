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
exports.DistributeCards = void 0;
const __1 = require("..");
const Config_1 = require("../../Config");
const emitter_1 = require("../../Connection/emitter");
const Constants_1 = require("../../Constants");
const gameRedisOperations_1 = require("../../GameRedisOperations/gameRedisOperations");
const logger_1 = require("../../Logger/logger");
const randomPlayer_1 = require("../../RandomPlayerTurn/randomPlayer");
const DistributeCards = (tableId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, logger_1.Logger)("DistributeCards", JSON.stringify({ tableId }));
        const CONFIG = (0, Config_1.Config)();
        const { MY_CARDS, ROUND_START } = Constants_1.CONSTANTS.EVENTS_NAME;
        let TableDetails = yield (0, gameRedisOperations_1.GetTable)(tableId);
        if (!TableDetails) {
            throw new Error(Constants_1.CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND);
        }
        ;
        const PowerCardNumber = 3;
        // const PowerCardNumber = await GAME_ACTIONS.RandomNumber(CONFIG.GamePlay.MIN_SPECIAL_CARD, CONFIG.GamePlay.MAX_SPECIAL_CARD);
        let AllUnoCards = JSON.parse(JSON.stringify(Constants_1.CONSTANTS.UNO_CARDS.ALL_UNO_CARDS));
        let SimpleUnoCards = JSON.parse(JSON.stringify(Constants_1.CONSTANTS.UNO_CARDS.SIMPLE_UNO_CARDS));
        let SpecialUnoCards = JSON.parse(JSON.stringify(Constants_1.CONSTANTS.UNO_CARDS.SPECIAL_UNO_CARDS));
        const AllUserSocketId = [];
        for (let i = 0; i < TableDetails.playersArray.length; i++) {
            let UserInTableDetails = yield (0, gameRedisOperations_1.GetUserInTable)(TableDetails.playersArray[i].userId);
            const UserDetails = yield (0, gameRedisOperations_1.GetUser)(TableDetails.playersArray[i].userId);
            for (let j = 0; j < CONFIG.GamePlay.DISTRIBUTE_CARDS_LIMIT; j++) {
                if (PowerCardNumber > j) {
                    const RendomNumber = yield __1.GAME_ACTIONS.RandomNumber(0, (SpecialUnoCards.length - 1));
                    let Card = SpecialUnoCards[RendomNumber];
                    // if(TableDetails.botPriority === CONSTANTS.BOT_PRIORITY.HARD){
                    //     const priorityNumber = await GAME_ACTIONS.RandomNumber(0, 100);
                    //     if(priorityNumber <= CONSTANTS.BOT_PRIORITY.HARD_PERCENT){
                    //         Card
                    //     }
                    // }
                    UserInTableDetails.cardArray.push(Card);
                    if (AllUnoCards.includes(Card)) {
                        AllUnoCards.splice(AllUnoCards.indexOf(Card), 1);
                    }
                    ;
                    if (SimpleUnoCards.includes(Card)) {
                        SimpleUnoCards.splice(SimpleUnoCards.indexOf(Card), 1);
                    }
                    ;
                    if (SpecialUnoCards.includes(Card)) {
                        SpecialUnoCards.splice(SpecialUnoCards.indexOf(Card), 1);
                    }
                    ;
                }
                else {
                    const RendomNumber = yield __1.GAME_ACTIONS.RandomNumber(0, (SimpleUnoCards.length - 1));
                    const Card = SimpleUnoCards[RendomNumber];
                    UserInTableDetails.cardArray.push(Card);
                    if (AllUnoCards.includes(Card)) {
                        AllUnoCards.splice(AllUnoCards.indexOf(Card), 1);
                    }
                    ;
                    if (SimpleUnoCards.includes(Card)) {
                        SimpleUnoCards.splice(SimpleUnoCards.indexOf(Card), 1);
                    }
                    ;
                    if (SpecialUnoCards.includes(Card)) {
                        SpecialUnoCards.splice(SpecialUnoCards.indexOf(Card), 1);
                    }
                    ;
                }
                ;
            }
            ;
            AllUserSocketId.push({ socketId: UserDetails.socketId, Cards: UserInTableDetails.cardArray });
            yield (0, gameRedisOperations_1.SetUserInTable)(TableDetails.playersArray[i].userId, UserInTableDetails);
        }
        ;
        TableDetails.playersArray = TableDetails.playersArray.sort((a, b) => { return a.seatIndex - b.seatIndex; });
        const ShuffelCard = yield __1.GAME_ACTIONS.ShuffleArray(SimpleUnoCards);
        // const ShuffelCard = await GAME_ACTIONS.ShuffleArray(AllUnoCards);
        TableDetails.openCardDeck.push(ShuffelCard[0]);
        TableDetails.activeCard = ShuffelCard[0];
        TableDetails.activeCardType = ShuffelCard[0].split("-")[1];
        TableDetails.activeCardColor = ShuffelCard[0].split("-")[0];
        ShuffelCard.splice(0, 1);
        TableDetails.closeCardDeck = ShuffelCard;
        // await BullTimer.AddJob.Round(tableId);
        // EventEmitter.emit(ROUND_START, { en: ROUND_START, RoomId: tableId, Data: { timer: CONFIG.GamePlay.ROUND_TIMER } });
        for (let i = 0; i < AllUserSocketId.length; i++) {
            const MyCardsResData = {
                activeCard: TableDetails.activeCard,
                openCardDeck: TableDetails.openCardDeck,
                playerCard: AllUserSocketId[i].Cards
            };
            emitter_1.EventEmitter.emit(MY_CARDS, { en: MY_CARDS, SocketId: AllUserSocketId[i].socketId, Data: MyCardsResData });
        }
        ;
        yield (0, gameRedisOperations_1.SetTable)(TableDetails.tableId, TableDetails);
        yield (0, randomPlayer_1.RandomPlayerTurn)(TableDetails.tableId);
    }
    catch (error) {
        (0, logger_1.Logger)('DistributeCards Error : ', error);
    }
});
exports.DistributeCards = DistributeCards;
