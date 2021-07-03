const Transaction = require("./transaction");

class TransactionPool {
  constructor() {
    this.transactionMap = {};
  }

  clear() {
    this.transactionMap = {};
  }

  setTransaction(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  existingTransaction({ inputAddress }) {
    const transactions = Object.values(this.transactionMap);
    return transactions.find(transaction => transaction.input.address === inputAddress)
  }

  replaceTransactionPool(transactionMap) {
    this.transactionMap = transactionMap;
  }

  validTransactions() {
    return Object.values(this.transactionMap).filter(
      transaction => Transaction.validate(transaction)
    );
  }

  clearBlockchainTransactions({ chain }) {
    /* Iterate over all the blockchain transactions (already in blocks) */
    for (let i = 0; i < chain.length; i++) {
      const block = chain[i];
      for (let transaction of block.data) {
        /**
         * For each block's transactions data, check if the transaction is in the 
         * current local memory pool
         */
        if (this.transactionMap[transaction.id]) {
          delete this.transactionMap[transaction.id];
        }
      }
    }
  }

}

module.exports = TransactionPool;
