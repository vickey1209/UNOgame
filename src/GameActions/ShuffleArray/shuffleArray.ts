import { GAME_ACTIONS } from "..";

const ShuffleArray = async (NormalArray: Array<any>) => {

    const ForLimit = NormalArray.length;

    const Shuffel = [];

    for (let i = 0; i < ForLimit; i++) {

        const RendomNumber = await GAME_ACTIONS.RandomNumber(0, (NormalArray.length - 1));

        Shuffel.push(NormalArray[RendomNumber]);

        NormalArray.splice(RendomNumber, 1);

    };

    return Shuffel;

};

export { ShuffleArray };