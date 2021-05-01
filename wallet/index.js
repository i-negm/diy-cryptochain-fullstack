const { STARTING_BALANCE } = require('../config');
const { ec } = require('../util');

class Wallet {
  constructor() {
    this.balance = STARTING_BALANCE;

    const keyPair = ec.genKeyPair();
    // .encode('hex') is used to convert the EC key from (x,y) fomat to "hex" format
    this.publicKey = keyPair.getPublic().encode('hex');
  }
}

module.exports = Wallet;
