import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { EventEmitter } from "../Connection/emitter";
import { ApplyLock, RemoveLock } from "../Connection/redlock";
import { CONSTANTS } from "../Constants";
import { GAME_ACTIONS } from "../GameActions";
import { GetTable, GetUserInTable, SetTable, SetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { PickCardResInterface } from "../Interface/PickCardRes/PickCardResInterface";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";

const UnoClickProcessAction = async (Data: any) => {

    const Path = 'UnoClickProcessAction';

    const { PICK_CARD } = CONSTANTS.EVENTS_NAME;
    const { LOCK, TABLES } = CONSTANTS.REDIS_COLLECTION;

    const TablelockId = `${LOCK}:${TABLES}:${Data?.tableId}`;

    const Tablelock = await ApplyLock(Path, TablelockId);

    try {

        Logger("UnoClickProcessAction", JSON.stringify(Data));

        const CONFIG = Config();

        let pickCards: Array<string> = [], isGameEnd = false, isPlayableCard = false;

        let TableDetails: TableInterface = await GetTable(Data?.tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        if (TableDetails.isWinning) { throw new Error(CONSTANTS.ERROR_MESSAGES.WINNING_DONE) };

        if (TableDetails.isScoreScreen) { throw new Error(CONSTANTS.ERROR_MESSAGES.ROUND_SCORE_DONE) };

        if (!TableDetails.isTurnLock) { throw new Error(CONSTANTS.ERROR_MESSAGES.UNO_TURN_LOCK_ERROR) };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.seatIndex === Data?.unoSeatIndex });

        if (!UserAvailableInTable) { throw new Error(CONSTANTS.ERROR_MESSAGES.WRONG_TABLE) };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(UserAvailableInTable?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        if (UserInTableDetails.cardArray.length !== 1) { throw new Error(CONSTANTS.ERROR_MESSAGES.NO_UNO_PENALTY) };

        if (UserInTableDetails.isUnoClick) {

            await BullTimer.AddJob.TurnInfo(TableDetails.tableId, Data?.isSkip, Data?.skipSeatIndex, Data?.isRevers, Data?.delayNumber);

        } else {

            if (TableDetails.closeCardDeck.length > CONFIG.GamePlay.UNO_PENALTY_NUMBER) {

                for (let i = 0; i < CONFIG.GamePlay.UNO_PENALTY_NUMBER; i++) {

                    UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

                    pickCards.push(TableDetails.closeCardDeck[0]);

                    TableDetails.closeCardDeck.splice(0, 1);

                };

            } else {

                const IsShufflePossibleData = await GAME_ACTIONS.IsShufflePossible(TableDetails.tableId);

                if (!IsShufflePossibleData) { throw new Error(CONSTANTS.ERROR_MESSAGES.CLOSE_DECK_FILL_ERROR) };

                if (IsShufflePossibleData.isShuffle) {

                    TableDetails.closeCardDeck = IsShufflePossibleData.cardsForCloseDeckArray;
                    TableDetails.openCardDeck = IsShufflePossibleData.cardsForOpenDeckArray;

                } else {

                    isGameEnd = true;

                };

                if (TableDetails.closeCardDeck.length > CONFIG.GamePlay.UNO_PENALTY_NUMBER) {

                    for (let i = 0; i < CONFIG.GamePlay.UNO_PENALTY_NUMBER; i++) {

                        UserInTableDetails.cardArray.push(TableDetails.closeCardDeck[0]);

                        pickCards.push(TableDetails.closeCardDeck[0]);

                        TableDetails.closeCardDeck.splice(0, 1);

                    };

                    isGameEnd = false;

                } else {

                    isGameEnd = true;

                };
            };

            UserInTableDetails.isUnoClick = false;

            await SetUserInTable(UserInTableDetails.userId, UserInTableDetails);

            await SetTable(TableDetails.tableId, TableDetails);

            if (isGameEnd) {

                await GAME_ACTIONS.EndRound(TableDetails.tableId, false);

            } else {

                const { userId, tableId, seatIndex } = UserInTableDetails;

                const PickCardResData: PickCardResInterface = { userId, tableId, seatIndex, pickCards, isPlayableCard };

                EventEmitter.emit(PICK_CARD, { en: PICK_CARD, RoomId: TableDetails.tableId, Data: PickCardResData });

                await BullTimer.AddJob.TurnInfo(TableDetails.tableId, Data?.isSkip, Data?.skipSeatIndex, Data?.isRevers, Data?.delayNumber);

            };
        };

    } catch (error: any) {

        Logger('UnoClickProcessAction Error : ', error);

    } finally {

        await RemoveLock(Path, Tablelock);

    };
};

export { UnoClickProcessAction };