import { GAME_ACTIONS } from "..";
import { Config } from "../../Config";
import { EventEmitter } from "../../Connection/emitter";
import { CONSTANTS } from "../../Constants";
import { GetTable, GetUser, GetUserInTable, SetTable, SetUserInTable } from "../../GameRedisOperations/gameRedisOperations";
import { SignUpInterface } from "../../Interface/SignUp/SignUpInterface";
import { TableInterface } from "../../Interface/Table/TableInterface";
import { Logger } from "../../Logger/logger";
import { RandomPlayerTurn } from "../../RandomPlayerTurn/randomPlayer";

const DistributeCards = async (tableId: string) => {

    try {

        Logger("DistributeCards", JSON.stringify({ tableId }));

        const CONFIG = Config();

        const { MY_CARDS } = CONSTANTS.EVENTS_NAME;

        let TableDetails: TableInterface = await GetTable(tableId);

        if (!TableDetails) { throw new Error(CONSTANTS.ERROR_MESSAGES.TABLE_NOT_FOUND) };

        const PowerCardNumber = 0;
        // const PowerCardNumber = await GAME_ACTIONS.RandomNumber(CONFIG.GamePlay.MIN_SPECIAL_CARD, CONFIG.GamePlay.MAX_SPECIAL_CARD);

        let AllUnoCards = JSON.parse(JSON.stringify(CONSTANTS.ALL_UNO_CARDS));
        let SimpleUnoCards = JSON.parse(JSON.stringify(CONSTANTS.SIMPLE_UNO_CARDS));
        let SplecialUnoCards = JSON.parse(JSON.stringify(CONSTANTS.SPECIAL_UNO_CARDS));

        const AllUserSocketId = [];

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            let UserInTableDetails = await GetUserInTable(TableDetails.playersArray[i].userId);

            const UserDetails: SignUpInterface = await GetUser(TableDetails.playersArray[i].userId);

            for (let j = 0; j < 7; j++) {

                if (PowerCardNumber > j) {

                    const RendomNumber = await GAME_ACTIONS.RandomNumber(0, (SplecialUnoCards.length - 1));

                    const Card = SplecialUnoCards[RendomNumber];

                    UserInTableDetails.cardArray.push(Card);

                    if (AllUnoCards.includes(Card)) { AllUnoCards.splice(AllUnoCards.indexOf(Card), 1); }
                    if (SimpleUnoCards.includes(Card)) { SimpleUnoCards.splice(SimpleUnoCards.indexOf(Card), 1); }
                    if (SplecialUnoCards.includes(Card)) { SplecialUnoCards.splice(SplecialUnoCards.indexOf(Card), 1); }

                } else {

                    const RendomNumber = await GAME_ACTIONS.RandomNumber(0, (SimpleUnoCards.length - 1));

                    const Card = SimpleUnoCards[RendomNumber];

                    UserInTableDetails.cardArray.push(Card);

                    if (AllUnoCards.includes(Card)) { AllUnoCards.splice(AllUnoCards.indexOf(Card), 1); };
                    if (SimpleUnoCards.includes(Card)) { SimpleUnoCards.splice(SimpleUnoCards.indexOf(Card), 1); };
                    if (SplecialUnoCards.includes(Card)) { SplecialUnoCards.splice(SplecialUnoCards.indexOf(Card), 1); };

                }
            }

            AllUserSocketId.push({ socketId: UserDetails.socketId, Cards: UserInTableDetails.cardArray });

            await SetUserInTable(TableDetails.playersArray[i].userId, UserInTableDetails);
        }

        TableDetails.playersArray = TableDetails.playersArray.sort((a, b) => { return a.seatIndex - b.seatIndex });

        const ShuffelCard = await GAME_ACTIONS.ShuffleArray(SimpleUnoCards);
        // const ShuffelCard = await GAME_ACTIONS.ShuffleArray(AllUnoCards);

        TableDetails.openCardDeck.push(ShuffelCard[0]);

        TableDetails.activeCard = ShuffelCard[0];
        TableDetails.activeCardType = ShuffelCard[0].split("-")[1];
        TableDetails.activeCardColor = ShuffelCard[0].split("-")[0];

        ShuffelCard.splice(0, 1);

        TableDetails.closeCardDeck = ShuffelCard;

        for (let i = 0; i < AllUserSocketId.length; i++) {

            const ResData = {

                activeCard: TableDetails.activeCard,
                openCardDeck: TableDetails.openCardDeck,
                playerCard: AllUserSocketId[i].Cards

            }

            EventEmitter.emit(MY_CARDS, { en: MY_CARDS, SocketId: AllUserSocketId[i].socketId, Data: ResData });
        }

        await SetTable(TableDetails.tableId, TableDetails);

        await RandomPlayerTurn(TableDetails.tableId);

    } catch (error: any) {
        Logger('DistributeCards Error : ', error);
    }
}

export { DistributeCards };