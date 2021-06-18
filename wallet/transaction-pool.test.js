const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('.');

describe('TransactionPool', () => {
  let transactionPool, transaction;
  beforeEach(() => {
    transactionPool = new TransactionPool();
    transaction = new Transaction({
      amount: 50,
      recipient: 'foo-recipient',
      senderWallet: new Wallet()
    });
  });

  describe('setTransaction()', () => {
    it('adds a transaction', () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id])
        .toBe(transaction);
    });
  });
  
});
