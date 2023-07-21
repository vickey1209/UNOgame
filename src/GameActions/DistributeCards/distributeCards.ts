import { GAME_ACTIONS } from "..";
import { Config } from "../../Config";
import { EventEmitter } from "../../Connection/emitter";
import { CONSTANTS } from "../../Constants";
import { GetTable, GetUser, GetUserInTable, SetTable, SetUserInTable } from "../../GameRedisOperations/gameRedisOperations";
import { MyCardsResInterface } from "../../Interface/MyCardsRes/MyCardsResInterface";
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

        // const PowerCardNumber = 7
        const PowerCardNumber = await GAME_ACTIONS.RandomNumber(CONFIG.GamePlay.MIN_SPECIAL_CARD, CONFIG.GamePlay.MAX_SPECIAL_CARD);

        let AllUnoCards = JSON.parse(JSON.stringify(CONSTANTS.UNO_CARDS.ALL_UNO_CARDS));
        let SimpleUnoCards = JSON.parse(JSON.stringify(CONSTANTS.UNO_CARDS.SIMPLE_UNO_CARDS));
        let SpecialUnoCards = JSON.parse(JSON.stringify(CONSTANTS.UNO_CARDS.SPECIAL_UNO_CARDS));
        // let botHardCards = JSON.parse(JSON.stringify(CONSTANTS.UNO_CARDS.BOT_HARD_CARDS));

        const AllUserSocketId = [];

        const RendomNumber = await GAME_ACTIONS.RandomNumber(0, (SimpleUnoCards.length - 1));

        const Card = SimpleUnoCards[RendomNumber];

        TableDetails.openCardDeck.push(Card);

        TableDetails.activeCard = Card;
        TableDetails.activeCardType = Card.split("-")[1];
        TableDetails.activeCardColor = Card.split("-")[0];

        if (AllUnoCards.includes(Card)) { AllUnoCards.splice(AllUnoCards.indexOf(Card), 1); };
        if (SimpleUnoCards.includes(Card)) { SimpleUnoCards.splice(SimpleUnoCards.indexOf(Card), 1); };
        if (SpecialUnoCards.includes(Card)) { SpecialUnoCards.splice(SpecialUnoCards.indexOf(Card), 1); };
        // if (botHardCards.includes(Card)) { botHardCards.splice(botHardCards.indexOf(Card), 1); };

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            let UserInTableDetails = await GetUserInTable(TableDetails.playersArray[i].userId);

            const UserDetails: SignUpInterface = await GetUser(TableDetails.playersArray[i].userId);

            for (let j = 0; j < CONFIG.GamePlay.DISTRIBUTE_CARDS_LIMIT; j++) {

                if (PowerCardNumber > j) {

                    const RendomNumber = await GAME_ACTIONS.RandomNumber(0, (SpecialUnoCards.length - 1));
                    let Card = SpecialUnoCards[RendomNumber];

                    // if(TableDetails.botPriority === CONSTANTS.BOT_PRIORITY.HARD && TableDetails.playersArray[i].isBot && botHardCards.length > 0){
                    //     const priorityNumber = await GAME_ACTIONS.RandomNumber(0, 100);
                    //     if(priorityNumber <= CONSTANTS.BOT_PRIORITY.HARD_PERCENT){
                    //         const RendomNumber = await GAME_ACTIONS.RandomNumber(0, (botHardCards.length - 1));
                    //         Card = botHardCards[RendomNumber];
                    //     }
                    // }else if(!TableDetails.playersArray[i].isBot && botHardCards.length > 0){
                    //     const priorityNumber = await GAME_ACTIONS.RandomNumber(0, 100);
                    //     if(priorityNumber > CONSTANTS.BOT_PRIORITY.HARD_PERCENT){
                    //         const RendomNumber = await GAME_ACTIONS.RandomNumber(0, (botHardCards.length - 1));
                    //         Card = botHardCards[RendomNumber];
                    //     }
                    // }

                    UserInTableDetails.cardArray.push(Card);

                    if (AllUnoCards.includes(Card)) { AllUnoCards.splice(AllUnoCards.indexOf(Card), 1); };
                    if (SimpleUnoCards.includes(Card)) { SimpleUnoCards.splice(SimpleUnoCards.indexOf(Card), 1); };
                    if (SpecialUnoCards.includes(Card)) { SpecialUnoCards.splice(SpecialUnoCards.indexOf(Card), 1); };
                    // if (botHardCards.includes(Card)) { botHardCards.splice(botHardCards.indexOf(Card), 1); };


                } else {

                    const RendomNumber = await GAME_ACTIONS.RandomNumber(0, (SimpleUnoCards.length - 1));

                    const Card = SimpleUnoCards[RendomNumber];

                    UserInTableDetails.cardArray.push(Card);

                    if (AllUnoCards.includes(Card)) { AllUnoCards.splice(AllUnoCards.indexOf(Card), 1); };
                    if (SimpleUnoCards.includes(Card)) { SimpleUnoCards.splice(SimpleUnoCards.indexOf(Card), 1); };
                    if (SpecialUnoCards.includes(Card)) { SpecialUnoCards.splice(SpecialUnoCards.indexOf(Card), 1); };
                    // if (botHardCards.includes(Card)) { botHardCards.splice(botHardCards.indexOf(Card), 1); };


                };
            };

            AllUserSocketId.push({ socketId: UserDetails.socketId, Cards: UserInTableDetails.cardArray });

            await SetUserInTable(TableDetails.playersArray[i].userId, UserInTableDetails);
        };

        TableDetails.playersArray = TableDetails.playersArray.sort((a, b) => { return a.seatIndex - b.seatIndex });

        const ShuffelCard = await GAME_ACTIONS.ShuffleArray(AllUnoCards);

        TableDetails.closeCardDeck = ShuffelCard;

        for (let i = 0; i < AllUserSocketId.length; i++) {

            const MyCardsResData: MyCardsResInterface = {

                activeCard: TableDetails.activeCard,
                openCardDeck: TableDetails.openCardDeck,
                playerCard: AllUserSocketId[i].Cards

            };

            EventEmitter.emit(MY_CARDS, { en: MY_CARDS, SocketId: AllUserSocketId[i].socketId, Data: MyCardsResData });
        };

        await SetTable(TableDetails.tableId, TableDetails);

        await RandomPlayerTurn(TableDetails.tableId);

    } catch (error: any) {
        Logger('DistributeCards Error : ', error);
    };
};

export { DistributeCards };