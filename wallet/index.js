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
    let hasConductedTransaction = false;
    let currentBalance = 0;

    /**
     * Start scanning the blockchain in reverse, until:
     *  1) you reach a block that our wallet has done a transaction in, then returning the summed balance till this moment.
     *  2) you reach the starting block, then return all the summed balance + STARTING_BALANCE
     */
    for(let i=chain.length-1; i>0; i--) {
      const block = chain[i];
      for(let transaction of block.data) {
        /* Check if this block has a transaction by our wallet */
        if(transaction.input.address === address) {
          hasConductedTransaction = true;
        }
        if(transaction.outputMap[address]) {
          currentBalance += transaction.outputMap[address];
        }
      }
      if(hasConductedTransaction) {
        /**
         * Stops the calculation as we've hit a block where
         * our wallet has conducted a transaction
         */
        break;
      }
    }
    return hasConductedTransaction? currentBalance: STARTING_BALANCE + currentBalance;
  }
}

module.exports = Wallet;
