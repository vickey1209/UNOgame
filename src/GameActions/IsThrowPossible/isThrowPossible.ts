import { CONSTANTS } from "../../Constants";
import { TableInterface } from "../../Interface/Table/TableInterface";
import { UserInTableInterface } from "../../Interface/UserInTable/UserInTableInterface";
import { ErrorLogger, Logger } from "../../Logger/logger";

const IsThrowPossible = async (UserInTableDetails: UserInTableInterface, TableDetails: TableInterface) => {

    try {

        await Logger("IsThrowPossible", JSON.stringify({ UserInTableDetails }));

        let isThrowPossible: boolean = false, throwPossibleCards: Array<string> = [];

        for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {

            const OneCard = UserInTableDetails.cardArray[i];
            const OneCardColor = OneCard.split("-")[0];
            const OneCardType = OneCard.split("-")[1];

            if (OneCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR && OneCardColor === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD) { isThrowPossible = true, throwPossibleCards.push(OneCard) };

            if (OneCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE && TableDetails.numberOfCardToPick === 0) { isThrowPossible = true, throwPossibleCards.push(OneCard) };

            if (TableDetails.numberOfCardToPick === 0) {

                if (OneCardType === TableDetails.activeCardType || OneCardColor === TableDetails.activeCardColor) { isThrowPossible = true, throwPossibleCards.push(OneCard) };

            } else {

                if (OneCardType === TableDetails.activeCardType) { isThrowPossible = true, throwPossibleCards.push(OneCard) };

            };

            // if (isThrowPossible) { break };

        };

        // return { isThrowPossible, throwPossibleCards };

        return isThrowPossible;

    } catch (error: any) {
        await ErrorLogger('IsThrowPossible Error : ', error);
    };
};

export { IsThrowPossible };