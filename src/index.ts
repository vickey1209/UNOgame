import { Initialize } from "./Connection/init";

// Initialize();

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

// const arr = [444, 444, 22, 22, 22, 1, 2, 1, 2, 1, 1];

// let finalArray: any = [], isAvailable = false;

// for (let i = 0; i < arr.length; i++) {

//     isAvailable = false;

//     if (finalArray.length === 0) {

//         finalArray.push({ [`${arr[i]}`]: 1 });

//     } else {

//         finalArray.forEach((element: any) => { if (Number(Object.keys(element)[0]) === arr[i]) { isAvailable = true }; });

//         if (isAvailable) { finalArray = [...finalArray].map((e: any) => { return Number(Object.keys(e)[0]) === arr[i] ? { ...e, [`${arr[i]}`]: e?.[`${arr[i]}`] + 1 } : e }); }
//         else { finalArray.push({ [`${arr[i]}`]: 1 }); };

//     };
// };

// console.log(finalArray);

let RoundScoreArray = [
    { userId: "1", userName: "Arya", isLeave: false, userScore: -1 },
    { userId: "12", userName: "Navin", isLeave: false, userScore: 0 },
    { userId: "123", userName: "Rutvik", isLeave: false, userScore: -10 },
    { userId: "1234", userName: "Rohit", isLeave: false, userScore: -5 }
];

let FinalArray: any = [], RankNumber = 1, lastScore = 0;

RoundScoreArray = RoundScoreArray.sort((a, b) => { return b.userScore - a.userScore; }).sort((a: any, b: any) => { return a.isLeave - b.isLeave; });

RoundScoreArray.forEach((Player, Index) => {

    if (Index === 0) { lastScore = Player.userScore; };

    if (lastScore === Player.userScore && !Player.isLeave && RankNumber <= 2) {

        FinalArray.push({ ...Player, RankNumber });

    } else {

        RankNumber += 1;
        lastScore = Player.userScore;
        FinalArray.push({ ...Player, RankNumber });

    };
});

// console.log("FinalArray");
// console.log(FinalArray);

const RoundWiseScoreArray = [

    { "userId": "1", "roundScore": -97, "currentRound": 1 },
    { "userId": "12", "roundScore": -115, "currentRound": 1 },
    { "userId": "123", "roundScore": -113, "currentRound": 1 },
    { "userId": "1234", "roundScore": -108, "currentRound": 1 },
    { "userId": "1", "roundScore": -108, "currentRound": 2 },
    { "userId": "12", "roundScore": -120, "currentRound": 2 },
    { "userId": "123", "roundScore": -104, "currentRound": 2 },
    { "userId": "1234", "roundScore": -113, "currentRound": 2 },
    { "userId": "1", "roundScore": -109, "currentRound": 3 },
    { "userId": "12", "roundScore": -101, "currentRound": 3 },
    { "userId": "123", "roundScore": -113, "currentRound": 3 },
    { "userId": "1234", "roundScore": -101, "currentRound": 3 }

];

const SecondFinalScore = [
    { userId: '12', userName: 'Navin', isLeave: false, userScore: 0, RankNumber: 1 },
    { userId: '1', userName: 'Arya', isLeave: false, userScore: -1, RankNumber: 2 },
    { userId: '1234', userName: 'Rohit', isLeave: false, userScore: -5, RankNumber: 3 },
    { userId: '123', userName: 'Rutvik', isLeave: false, userScore: -10, RankNumber: 4 }
]

let FinalRoundWiseScoreArray: any = [];

// for (let i = 0; i < SecondFinalScore.length; i++) {

//     const UserId = SecondFinalScore[i].userId;

//     console.log(`UserId > ${UserId}`);

//     for (let k = 0; k < RoundWiseScoreArray.length; k++) {

//         let UserDetailIndex = -1;

//         const UserDetail = RoundWiseScoreArray.find((e, index) => {
//             UserDetailIndex = index
//             return e.userId === UserId
//         });

//         // const UserDetail = RoundWiseScoreArray.find((e, index) => { return e.userId === UserId, UserDetailIndex = index; });

//         RoundWiseScoreArray.splice(UserDetailIndex,1)

//         // console.log({ UserDetail, UserDetailIndex });


//         if (UserDetail) {
//             temp.push(UserDetail);
//             // console.log(UserDetail);

//         } else {
//             break;
//         }
//     }
// };

console.time('11')

for (let i = (SecondFinalScore.length - 1); i >= 0; i--) {

    for (let k = (RoundWiseScoreArray.length - 1); k >= 0; k--) {

        let UserDetailIndex = -1;

        const UserDetail = RoundWiseScoreArray.find((element, index) => {
            UserDetailIndex = index
            return element.userId === SecondFinalScore[i]?.userId
        });

        if (UserDetail && UserDetailIndex !== -1) {
            RoundWiseScoreArray.splice(UserDetailIndex, 1);
            FinalRoundWiseScoreArray.push(UserDetail);
        } else {
            break;
        };
    };
};

for (let i = (SecondFinalScore.length - 1); i >= 0; i--) {

    for (let k = 0; k < RoundWiseScoreArray.length; k++) { if (RoundWiseScoreArray[k].userId === SecondFinalScore[i].userId) { FinalRoundWiseScoreArray.unshift(RoundWiseScoreArray[k]); }; }
    // for (let k = 0; k < RoundWiseScoreArray.length; k++) { if (RoundWiseScoreArray[k].userId === SecondFinalScore[i].userId) { FinalRoundWiseScoreArray.splice(0, 0, RoundWiseScoreArray[k]); }; }

};

FinalRoundWiseScoreArray = FinalRoundWiseScoreArray.reverse().sort((a: any, b: any) => { return a.currentRound - b.currentRound; });
// FinalRoundWiseScoreArray = FinalRoundWiseScoreArray.sort((a: any, b: any) => { return a.currentRound - b.currentRound; });

console.timeEnd('11')

console.log(FinalRoundWiseScoreArray);


// for (let i = 0; i < RoundScoreArray.length; i++) {

//     if (i === 0) { lastScore = RoundScoreArray[i].userScore; };

//     if (lastScore === RoundScoreArray[i].userScore && RankNumber <= 2) {
//         // if (lastScore === RoundScoreArray[i].userScore) {

//         FinalArray.push({ ...RoundScoreArray[i], RankNumber });

//     } else {

//         RankNumber += 1;
//         lastScore = RoundScoreArray[i].userScore;
//         FinalArray.push({ ...RoundScoreArray[i], RankNumber });

//     }
// }

// console.log("FinalArray");
// console.log(FinalArray);
