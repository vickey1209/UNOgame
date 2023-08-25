import { TableInterface } from "../../Interface/Table/TableInterface"
import { ErrorLogger, Logger } from "../../Logger/logger";

const ClockWiseTurnChange = async (TableDetails: TableInterface) => {

    try {

        await Logger("ClockWiseTurnChange", JSON.stringify({ TableDetails }));

        let NextTurn = TableDetails.currentTurn + 1;

        for (let i = 0; i < TableDetails.playersArray.length; i++) {

            if ((TableDetails.playersArray.length - 1) < NextTurn) { NextTurn = 0; };

            if (TableDetails.playersArray[NextTurn].isLeave === true) {
                NextTurn += 1;
            } else {
                break;
            };
        };

        await Logger("ClockWiseTurnChange Return", JSON.stringify({ NextTurn }));

        return NextTurn;

    } catch (error: any) {
        await ErrorLogger('ClockWiseTurnChange Error : ', error);
    };
};

const AntiClockWiseTurnChange = async (TableDetails: TableInterface) => {

    try {

        await Logger("AntiClockWiseTurnChange", JSON.stringify({ TableDetails }));

        let NextTurn = TableDetails.currentTurn - 1;

        for (let i = TableDetails.playersArray.length; i > 0; i--) {

            if ((TableDetails.playersArray.length - 1) < NextTurn) { NextTurn = 0; };

            if (NextTurn < 0) { NextTurn = TableDetails.playersArray.length - 1 };

            if (TableDetails.playersArray[NextTurn].isLeave === true) {
                NextTurn -= 1;
            } else {
                break;
            };
        };

        await Logger("AntiClockWiseTurnChange Return", JSON.stringify({ NextTurn }));

        return NextTurn;

    } catch (error: any) {
        await ErrorLogger('AntiClockWiseTurnChange Error : ', error);
    };
};

export { ClockWiseTurnChange, AntiClockWiseTurnChange };