const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');
const Transaction = require('./transaction');

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;

    this.keyPair = ec.genKeyPair();
    // .encode('hex') is used to convert the EC key from (x,y) fomat to "hex" format
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  sign(data) {
    // Sign a hashed value of the data
    return this.keyPair.sign(cryptoHash(data));
  }

  createTransaction({ amount, recipient, chain }) {
    if(chain) {
      this.balance = Wallet.calculateBalance({ 
        chain, 
        address: this.publicKey 
      });
    }
    return new Transaction({
      amount,
      recipient,
      senderWallet: this
    });
  }

  static calculateBalance({chain, address}) {
    let currentBalance = STARTING_BALANCE;

    for(let i=0; i<chain.length; i++) {
      const block = chain[i];
      for(let transaction of block.data) {
        if(transaction.outputMap[address]) {
          currentBalance += transaction.outputMap[address];
        }
      }
    }
    return currentBalance;
  }
}

module.exports = Wallet;
