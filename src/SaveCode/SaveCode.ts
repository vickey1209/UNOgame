// * Winning Calculation Logic

let RoundScoreArray = [
    { userId: "1", userName: "Arya", isLeave: false, userScore: 0 },
    { userId: "12", userName: "Navin", isLeave: true, userScore: 0 },
    { userId: "123", userName: "Rutvik", isLeave: false, userScore: 0 },
    { userId: "1234", userName: "Rohit", isLeave: false, userScore: 0 }
];

let FinalArray: any = [], RankNumber = 1, lastScore = 0;

RoundScoreArray = RoundScoreArray.sort((a, b) => { return b.userScore - a.userScore; }).sort((a: any, b: any) => { return a.isLeave - b.isLeave; });

for (let i = 0; i < RoundScoreArray.length; i++) { // ^ For ...

    if (i === 0) { lastScore = RoundScoreArray[i].userScore; };

    if (lastScore === RoundScoreArray[i].userScore && RankNumber <= 2) {
        // if (lastScore === RoundScoreArray[i].userScore) {

        FinalArray.push({ ...RoundScoreArray[i], RankNumber });

    } else {

        RankNumber += 1;
        lastScore = RoundScoreArray[i].userScore;
        FinalArray.push({ ...RoundScoreArray[i], RankNumber });

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


// * Winning Calculation Logic