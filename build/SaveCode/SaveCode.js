"use strict";
// * Winning Calculation Logic
let RoundScoreArray = [
    { userId: "1", userName: "Arya", isLeave: false, userScore: 0 },
    { userId: "12", userName: "Navin", isLeave: true, userScore: 0 },
    { userId: "123", userName: "Rutvik", isLeave: false, userScore: 0 },
    { userId: "1234", userName: "Rohit", isLeave: false, userScore: 0 }
];
let FinalArray = [], RankNumber = 1, lastScore = 0;
RoundScoreArray = RoundScoreArray.sort((a, b) => { return b.userScore - a.userScore; }).sort((a, b) => { return a.isLeave - b.isLeave; });
for (let i = 0; i < RoundScoreArray.length; i++) { // ^ For ...
    if (i === 0) {
        lastScore = RoundScoreArray[i].userScore;
    }
    ;
    if (lastScore === RoundScoreArray[i].userScore && RankNumber <= 2) {
        // if (lastScore === RoundScoreArray[i].userScore) {
        FinalArray.push(Object.assign(Object.assign({}, RoundScoreArray[i]), { RankNumber }));
    }
    else {
        RankNumber += 1;
        lastScore = RoundScoreArray[i].userScore;
        FinalArray.push(Object.assign(Object.assign({}, RoundScoreArray[i]), { RankNumber }));
    }
}
// RoundScoreArray.forEach((Player, Index) => { // ^ ForEach ...
//     if (Index === 0) { lastScore = Player.userScore; };
//     console.log({ Player, Index, lastScore });
//     // if (lastScore === Player.userScore && !Player.isLeave) {
//     if (lastScore === Player.userScore && !Player.isLeave && RankNumber <= 2) {
//         FinalArray.push({ ...Player, RankNumber });
//     } else {
//         RankNumber += 1;
//         lastScore = Player.userScore;
//         FinalArray.push({ ...Player, RankNumber });
//     };
// });
console.log("FinalArray");
console.log(FinalArray);
let FinalRoundWiseScoreArray = [];
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
for (let i = (FinalArray.length - 1); i >= 0; i--) {
    for (let k = (RoundWiseScoreArray.length - 1); k >= 0; k--) {
        let UserDetailIndex = -1;
        const UserDetail = RoundWiseScoreArray.find((element, index) => {
            var _a;
            UserDetailIndex = index;
            return element.userId === ((_a = FinalArray[i]) === null || _a === void 0 ? void 0 : _a.userId);
        });
        if (UserDetail && UserDetailIndex !== -1) {
            RoundWiseScoreArray.splice(UserDetailIndex, 1);
            FinalRoundWiseScoreArray.push(UserDetail);
        }
        else {
            break;
        }
        ;
    }
    ;
}
;
FinalRoundWiseScoreArray = FinalRoundWiseScoreArray.reverse().sort((a, b) => { return a.currentRound - b.currentRound; });
console.log(FinalRoundWiseScoreArray);
// * Winning Calculation Logic
