import { Initialize } from "./Connection/init";

Initialize();

// const Rounds = [
//     { userId: "1", roundScore: -121, currentRound: 1 },
//     { userId: "12", roundScore: -141, currentRound: 1 },
//     { userId: "123", roundScore: -94, currentRound: 1 },
//     { userId: "1234", roundScore: -107, currentRound: 1 },
//     { userId: "1", roundScore: -130, currentRound: 2 },
//     { userId: "12", roundScore: -141, currentRound: 2 },
//     { userId: "123", roundScore: -104, currentRound: 2 },
//     { userId: "1234", roundScore: -108, currentRound: 2 },
//     { userId: "1", roundScore: -91, currentRound: 3 },
//     { userId: "12", roundScore: -142, currentRound: 3 },
//     { userId: "123", roundScore: -134, currentRound: 3 },
//     { userId: "1234", roundScore: -94, currentRound: 3 }
// ];

// // console.log(Rounds);

// console.time('F')

// let FinalScore: any = [];

// for (let i = 0; i < Rounds.length; i++) {

//     if (!FinalScore.find((e: any) => { return e.userId === Rounds[i].userId; })) { FinalScore.push(Rounds[i]); }
//     else { FinalScore = [...FinalScore].map((e: any) => { delete e['currentRound']; return e.userId === Rounds[i].userId ? { ...e, roundScore: e.roundScore + Rounds[i].roundScore } : e }); };

// };


// // const groupBy = (array: any, key: any) => array.reduce((result: any, currentValue: any) => {
// //     (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue)
// //     return result;
// // }, {});


// // const FinalScore = Object.entries(groupBy(Rounds, "userId")).map(([key, value]: any) => ({ userId: key, roundScore: value.reduce((total: any, { roundScore }: any) => total + roundScore, 0) }));

// console.timeEnd('F')

// console.log();
// console.log(new Date());
// console.log(FinalScore);
// console.log(new Date());
// console.log();