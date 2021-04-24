const Block = require('./block');
const cryptoHash = require('./crypto-hash');

class Blockchain {
  constructor() {
    this.chain = [Block.genesis()];
  }

  addBlock({ data }) {
    this.chain.push(Block.mineBlock(
      {
        lastBlock: this.chain[this.chain.length - 1],
        data
      }
    ));
  }

  replaceChain(newChain) {
    if (this.chain.length >= newChain.length) {
      console.error("The new chain must be longer than the one used.");
      return;
    }

    if (!Blockchain.isValidChain(newChain)) {
      console.error("The new chain must be a valid chain.");
      return;
    }

    this.chain = newChain;
  }

  static isValidChain(chain) {
    // Check the genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
      return false;

    for (let i = 1; i < chain.length; i++) {
      const block = chain[i];
      const { timestamp, data, lastHash, hash } = block;
      // Check if every block has the hash of the previous one
      if (block.lastHash !== chain[i - 1].hash)
        return false;
      // Check if the blokc itself did not be tampered
      const calculatedHash = cryptoHash(data, lastHash, timestamp);
      if (calculatedHash !== block.hash)
        return false;
    }
    return true;
  }
}

module.exports = Blockchain;