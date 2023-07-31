import { Initialize } from "./Connection/init";

console.log('🔥');
console.log('⚡');
console.log('🔥');
console.log('⚡');
console.log('🔥');
console.log('⚡');

Initialize();

// let First: any = {

//     "1": "111,112,123",
//     "2": "232,351,235,234",
//     "3": "242,241,240,243",
//     '5': '123'

// };

// let Send: any = {

//     "4": "113,234234",
//     "5": "123",

// };

// const SendAllKeys = Object.keys(Send);

// for (let i = 0; i < SendAllKeys.length; i++) {

//     if (First[`${SendAllKeys[i]}`]) {

//         const FirstValues = First[`${SendAllKeys[i]}`].split(',').map((item:any) => item.trim());

//         const SendValues = Send[`${SendAllKeys[i]}`].split(',').map((item:any) => item.trim());

//         SendValues.forEach((element: any) => {

//             if (FirstValues.includes(element)) { FirstValues.splice(FirstValues.indexOf(element), 1); }
//             else { FirstValues.push(element); };

//         });

//         First[`${SendAllKeys[i]}`] = FirstValues.join();

//     } else { First[`${SendAllKeys[i]}`] = Send[`${SendAllKeys[i]}`]; };

//     if (!First[`${SendAllKeys[i]}`]) { delete First[`${SendAllKeys[i]}`] };

// };

// console.log(`First > `, First);