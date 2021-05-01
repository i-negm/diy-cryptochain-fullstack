const { STARTING_BALANCE } = require('../config');
const { ec, cryptoHash } = require('../util');

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
}

module.exports = Wallet;
