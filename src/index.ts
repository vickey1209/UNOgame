import { Initialize } from "./Connection/init";
import os from 'os';
import cluster from "cluster";

console.log('🔥');
console.log('⚡');
console.log('🔥');
console.log('⚡');
console.log('🔥');
console.log('⚡');

if (cluster.isPrimary) {

    console.log({ Main: process.pid });

    for (let i = 0; i < os.cpus().length; i++) { cluster.fork(); };

    cluster.on('exit', (worker, code, signal) => { cluster.fork() })

} else {

    console.log({ Workers: process.pid });

    Initialize();

};

// Initialize();

// console.log(os.cpus());
// console.log(os.cpus().length);