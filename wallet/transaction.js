const { v4: uuidv4 } = require('uuid');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const { verifySignature } = require('../util');

class Transaction {
  constructor({ senderWallet, recipient, amount, outputMap, input }) {

    if (input != REWARD_INPUT && amount > senderWallet.balance) {
      /* Make sure that it's a normal transaction, as the reward transaction
         does not have some props */
      throw new Error('Amount exceeds balance.');
    }

    this.id = uuidv4();
    this.outputMap = outputMap || this.createOutputMap({ senderWallet, recipient, amount });
    this.input = input || this.createInputMap({ senderWallet, outputMap: this.outputMap });
  }

  /** Helper method  */
  createOutputMap({ senderWallet, recipient, amount }) {
    const outputMap = {};
    outputMap[recipient] = amount;
    outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
    return outputMap;
  }

  /** Helper function */
  createInputMap({ senderWallet, outputMap }) {
    return {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.publicKey,
      signature: senderWallet.sign(outputMap)
    };
  }

  update({ senderWallet, recipient, amount }) {
    const { publicKey } = senderWallet;
    const senderBalance = this.outputMap[publicKey];

    if (amount > senderBalance) {
      throw new Error('Amount exceeds balance.');
    }

    if (this.outputMap[recipient] === undefined) {
      // Initialize recipient amount = 0 (if first time)
      this.outputMap[recipient] = 0;
    }

    // Assign the amount to the recipient and subtract it from the sender remaining balance
    this.outputMap[recipient] += amount
    this.outputMap[publicKey] -= amount;
    this.input =  this.createInputMap({ senderWallet, outputMap: this.outputMap });
  }

  static validate(transaction) {
    const { input : { address, amount, signature } , outputMap } = transaction;

    // Check if amount in == amout out
    const outputTotal = Object.values(outputMap)
      .reduce((total, outputAmount) => total + outputAmount);
    if(amount !== outputTotal) {
      console.error(`[ERROR] Invalid transaction from ${address}, amounts not add up.`);
      return false;
    }
    
    // Check the signature
    if( verifySignature({ publicKey: address, data: outputMap, signature }) === false ) {
      console.error(`[ERROR] Invalid transaction from ${address}, wrong signature.`);
      return false;
    }

    return true;
  }

  static rewardTransaction({ minerWallet }) {
    return new this({
      input: REWARD_INPUT,
      outputMap : { [minerWallet.publicKey] : MINING_REWARD }
    });
  }
}

module.exports = Transaction;
