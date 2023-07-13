import { CONSTANTS } from "../../Constants";
import { TableInterface } from "../../Interface/Table/TableInterface";
import { UserInTableInterface } from "../../Interface/UserInTable/UserInTableInterface";
import { Logger } from "../../Logger/logger";

const IsThrowPossible = async (UserInTableDetails: UserInTableInterface, TableDetails: TableInterface) => {

    try {

        Logger("IsThrowPossible", JSON.stringify({ UserInTableDetails }));

        let isThrowPossible = false;

        for (let i = 0; i < UserInTableDetails.cardArray.length; i++) {

            const OneCard = UserInTableDetails.cardArray[i];
            const OneCardColor = OneCard.split("-")[0];
            const OneCardType = OneCard.split("-")[1];

            if (OneCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.PLUS_FOUR && OneCardColor === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD) { isThrowPossible = true };

            if (OneCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE && TableDetails.numberOfCardToPick === 0) { isThrowPossible = true };
            // if (OneCardType === CONSTANTS.UNO_CARDS.CARDS_TYPE.COLOR_CHANGE && OneCardColor === CONSTANTS.UNO_CARDS.CARDS_TYPE.WILD_CARD && TableDetails.numberOfCardToPick === 0) { isThrowPossible = true };

            if (TableDetails.numberOfCardToPick === 0) {

                if (OneCardType === TableDetails.activeCardType || OneCardColor === TableDetails.activeCardColor) { isThrowPossible = true };

            } else {

                if (OneCardType === TableDetails.activeCardType) { isThrowPossible = true };

            };

            if (isThrowPossible) { break };

        };

        console.log(new Date());

        console.log({ isThrowPossible });

        return isThrowPossible;

    } catch (error: any) {
        Logger('IsThrowPossible Error : ', error);
    };
};

export { IsThrowPossible };