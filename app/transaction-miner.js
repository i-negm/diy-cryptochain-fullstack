const Transaction = require('../wallet/transaction');

class TransactionMiner {

  constructor({blockchain, transactionPool, wallet, pubsub}) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.pubsub = pubsub;
  }

  mineTransactions() {
    /* Get the valid transactions from pool */
    const validTransactions = this.transactionPool.validTransactions();
    /* Generate the miner's reward */
    const minerReward = Transaction.rewardTransaction({ minerWallet: this.wallet });
    /* Add the transaction of the mining reward to the list of valid transactions to be mined */
    validTransactions.push(minerReward);
    /* Add a block consisting of these transactions to the blockchain */
    this.blockchain.addBlock({ data: validTransactions });
    /* Broadcast the updated block to blockchain */
    this.pubsub.broadcastChain();
    /* Clear the pool */
    this.transactionPool.clear();
  }
}

module.exports = TransactionMiner;
