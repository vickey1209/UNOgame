import { CONSTANTS } from "../Constants";
import { GetTable, GetUserInTable } from "../GameRedisOperations/gameRedisOperations";
import { TableInterface } from "../Interface/Table/TableInterface";
import { UserInTableInterface } from "../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../Logger/logger";
import { PickCard } from "../PickCard/pickCard";
import { ThrowCard } from "../ThrowCard/throwCard";

const TakeTurn = async (tableId: string) => {

    try {

        Logger("TakeTurn", JSON.stringify({ tableId }));

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const UserAvailableInTable = TableDetails.playersArray.find(e => { return e.seatIndex === TableDetails.currentTurn });

        if (!UserAvailableInTable) { throw new Error(CONSTANTS.ERROR_MESSAGES.WRONG_TABLE) };

        let UserInTableDetails: UserInTableInterface = await GetUserInTable(UserAvailableInTable?.userId);

        if (!UserInTableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.USER_IN_TABLE_NOT_FOUND) };

        let isPlayableCard = false, playableCard = '';

        for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {

            if (UserInTableDetails.cardArray[i].split("-")[1] === TableDetails.activeCardType || UserInTableDetails.cardArray[i].split("-")[0] === TableDetails.activeCardColor) {

                playableCard = UserInTableDetails.cardArray[i];

                isPlayableCard = true;

                break;

            };
        };

        console.log({ isPlayableCard, playableCard, avtiveCard: TableDetails.activeCard });


        if (isPlayableCard) { // ^ Throw Card

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

                card: playableCard,
                cardType: playableCard.split('-')[1],
                cardColor: playableCard.split('-')[0],
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
        Logger('TakeTurn Error : ', error);
    };
};

export { TakeTurn };