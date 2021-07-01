class TransactionMiner {

  constructor({blockchain, transactionPool, wallet, pubsub}) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mineTransaction() {
    /* Get the valid transactions from pool */

    /* Generate the miner's reward */

    /* Add a block consisting of these transactions to the blockchain */

    /* Broadcast the updated block to blockchain */

    /* Clear the pool */

  }
}

module.exports = TransactionMiner;
