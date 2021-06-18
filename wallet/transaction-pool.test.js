const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('.');

describe('TransactionPool', () => {
  let transactionPool, transaction, senderWallet;
  beforeEach(() => {
    transactionPool = new TransactionPool();
    senderWallet = new Wallet();
    transaction = new Transaction({
      amount: 50,
      recipient: 'foo-recipient',
      senderWallet
    });
  });

  describe('setTransaction()', () => {
    it('adds a transaction', () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id])
        .toBe(transaction);
    });
  });

  describe('existingTransaction()', () => {
    it('returns an existing transaction given an input address ', () => {
      // Make sure that the transaction is already in the local pool
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.existingTransaction({ inputAddress : senderWallet.publicKey })
      ).toBe(transaction);
    });
  });
  
});
