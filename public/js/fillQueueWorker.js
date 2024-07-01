const { parentPort, workerData } = require('worker_threads');
const Walk = require('walk'); // Ensure you have the Walk module or replace with appropriate import

const dirToSearch = workerData.dirToSearch;
const walkFunc = workerData.walkFunc;

(async () => {
    await Walk.walk(dirToSearch, walkFunc);
    parentPort.postMessage('done');
})();
