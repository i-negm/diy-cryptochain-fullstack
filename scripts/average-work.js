const Blockchain = require('../blockchain');
const blockchain = new Blockchain();

blockchain.addBlock({ data : 'initial' });
let prevTimeStamp, nextTimeStamp, nextBlock, timeDiff, average;

const times = [];

// Print the header of the CSV
console.log('Height, Time to mine block, Difficulty, Average Time');

for (let i=0; i<10000; i++) {
  prevTimeStamp = blockchain.chain[blockchain.chain.length - 1].timestamp;
  blockchain.addBlock({ data : `block ${i}` });
  
  nextBlock = blockchain.chain[blockchain.chain.length - 1];
  nextTimeStamp = nextBlock.timestamp;
  
  timeDiff = nextTimeStamp - prevTimeStamp;
  times.push(timeDiff);

  // Get the average value
  average = times.reduce((total , num) => (total + num)) / times.length;
  // Logging the results
  console.log(`${i}, ${timeDiff}ms, ${nextBlock.difficulty}, ${average}ms`);
}