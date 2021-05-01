const { v4: uuidv4 } = require('uuid');
const { verifySignature } = require('../util');

class Transaction {
  constructor({ senderWallet, recipient, amount }) {
    this.id = uuidv4();
    this.outputMap = this.createOutputMap({ senderWallet, recipient, amount });
    this.input = this.createInputMap({ senderWallet, outputMap: this.outputMap });
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

}

module.exports = Transaction;