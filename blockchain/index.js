const Block = require('./block');
const { cryptoHash } = require("../util");
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    this.chain.push(Block.mineBlock(
      {
        lastBlock: this.chain[this.chain.length - 1],
        data : data
      }
    ));
  }

  replaceChain(newChain, onSuccess) {
    if (this.chain.length >= newChain.length) {
      console.error("The new chain must be longer than the one used.");
      return;
    }

    if (!Blockchain.isValidChain(newChain)) {
      console.error("The new chain must be a valid chain.");
      return;
    }
    
    /**
     * Calling onSuccess callback in case of the chain will be replaced.
     */
    if(onSuccess) onSuccess();
    
    
    console.log(`Replacing chain with:`, newChain);
    this.chain = newChain;
  }

  validTransactionData({ chain }) {
    for(let i=1; i<chain.length; i++) {
      const block = chain[i];
      const transactionSet = new Set();

      let rewardTransactionCount = 0;
      for(let transaction of block.data) {

        if(transaction.input.address === REWARD_INPUT.address) {
          /* For reward transaction */
          
          rewardTransactionCount += 1;
          /* Check if there is only one reward transaction per block */
          if (rewardTransactionCount > 1) {
            console.error('Miner rewards exceed limit');
            return false;
          }
          
          /* Check if the amount of the reward transaction is == `MINING_REWARD` */
          if(Object.values(transaction.outputMap)[0] != MINING_REWARD) {
            console.error('Miner reward amount is invalid');
            return false;
          }
        } else {
          /* For normal transaction */

          /* 1. Validate if the transaction (input == output), signature */
          if(!Transaction.validate(transaction)) {
            console.error('Invalid transaction');
            return false;
          }
          /* 2. Make sure that the current wallet has the same as input balance */
          const trueBalance = Wallet.calculateBalance({
            chain: this.chain,
            address: transaction.input.address
          });
          if (transaction.input.amount !== trueBalance) {
            console.error('Invalid input amount');
            return false;
          }
          
          /* 3. Check that the block has no duplicated transaction */
          if (transactionSet.has(transaction)) {
            console.error('Invalid usage, duplicated transaction on the same block');
            return false;
          } else {
            transactionSet.add(transaction);
          }
        }

      }
    }
    return true;
  }

  static isValidChain(chain) {
    // Check the genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const { timestamp, data, lastHash, hash, difficulty, nonce } = block;
      const lastDifficulty = chain[i - 1].difficulty;
      // Check if every block has the hash of the previous one
      if (block.lastHash !== chain[i - 1].hash)
        return false;
      // Check if the block itself did not be tampered
      const calculatedHash = cryptoHash(data, lastHash, timestamp, difficulty, nonce);
      if (calculatedHash !== block.hash)
        return false;
      // Difficulty shall be raised or lowered by one step no more than that
      if (Math.abs(lastDifficulty - difficulty) > 1)
        return false;
    }
    return true;
  }
}

module.exports = Blockchain;