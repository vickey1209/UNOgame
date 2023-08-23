import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { ErrorLogger, Logger } from "../Logger/logger";
import { PickCard } from "../PickCard/pickCard";
import { ThrowCard } from "../ThrowCard/throwCard";
import { GAME_ACTIONS } from "../GameActions";
import { BullTimer } from "../BullTimer";
import { Config } from "../Config";
import { getUserScore } from "../AllUserScore/allUserScore";
import { findActiveCard } from "./findActiveCard";

const TakeTurn = async (tableId: string) => {

    try {

        await Logger("TakeTurn", JSON.stringify({ tableId }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.seatIndex === TableDetails.currentTurn });

        if (!UserAvailableInTable) { throw new Error(CONSTANTS.ERROR_MESSAGES.WRONG_TABLE) };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(TableDetails.tableId, UserAvailableInTable?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        let detailsOfActiveCard = await findActiveCard(UserInTableDetails.cardArray,
            {
                tableId: TableDetails.tableId,
                activeCard: TableDetails.activeCard,
                cardNumber: TableDetails.activeCardType,
                currentTurnSeatIndex: TableDetails.currentTurn,
                robotType: TableDetails.botPriority,
                isClockwise: TableDetails.isClockwise,
                currentTurn: TableDetails.currentTurn,
                playersArray: TableDetails.playersArray,
                activeCardColor: TableDetails.activeCardColor,
            })

        console.log(" TakeTurn detailsOfActiveCard : ", detailsOfActiveCard);

        if (detailsOfActiveCard.flag == true && detailsOfActiveCard.card) { // ^ Throw Card

            let Fake_Socket = {

                id: 'Fake_SocketId',

                handshake: {

                    auth: {

                        userId: '',
                        tableId: '',
                        seatIndex: -1,
                        playerCount: 0,
                        bootValue: 0,

                    },
                },
            };

            const Fake_Data = {

                card: detailsOfActiveCard.card,
                cardType: detailsOfActiveCard.card.split('-')[1],
                cardColor: detailsOfActiveCard.C_C,
                cardIndex: 0,

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex

            };

            await ThrowCard('THROW_CARD', Fake_Socket, Fake_Data);

        } else { // ^ Pick Card

            let Fake_Socket = {

                id: 'Fake_SocketId',

                handshake: {

                    auth: {

                        userId: '',
                        tableId: '',
                        seatIndex: -1,
                        playerCount: 0,
                        bootValue: 0,

                    },
                },
            };

            const Fake_Data = {

                userId: UserInTableDetails.userId,
                tableId: UserInTableDetails.tableId,
                seatIndex: UserInTableDetails.seatIndex

            };

            await PickCard('PICK_CARD', Fake_Socket, Fake_Data);

        };

    } catch (error: any) {
        await ErrorLogger('TakeTurn Error : ', error);
    };
};

export { TakeTurn };