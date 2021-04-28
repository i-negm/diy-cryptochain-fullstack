const { MINE_RATE, GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

class Block {
    constructor ({ timestamp, lastHash, hash, data, nonce, difficulty }) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }
    
    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }) {
        let hash, timestamp, nonce = 0;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock : lastBlock, timestamp });
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);
        } while ( hash.substring(0, difficulty) != "0".repeat(difficulty) );

        return new this({ timestamp, lastHash, data, hash, difficulty, nonce });
    }

    static adjustDifficulty({ originalBlock, timestamp }) {
        const originalTimestamp = originalBlock.timestamp;
        const difficulty = originalBlock.difficulty;

        if (difficulty < 1)
            return 1;

        if (timestamp - originalTimestamp > MINE_RATE ) {
            return difficulty - 1;
        } else if (timestamp - originalTimestamp < MINE_RATE ) {
            return difficulty + 1;
        } else {
            return difficulty;
        }
    }
}

module.exports = Block;
