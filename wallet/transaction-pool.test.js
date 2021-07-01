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

  describe('validTransactions()', () => {
    let validTransactions, errorMock;

    beforeEach(() => {
      validTransactions = [];
      errorMock = jest.fn();
      global.console.error = errorMock;

      for (let i=0; i<10; i++) {
        transaction = new Transaction({
          senderWallet,
          recipient: 'any-recipient',
          amount: 30
        });

        /* For some transaction miss up with some of them */
        if(i%3 === 0) {
          transaction.input.amount = 999;
        } else if (i%3 === 1) {
          transaction.input.signature = new Wallet().sign('foo-signature');
        } else {
          validTransactions.push(transaction);
        }

        transactionPool.setTransaction(transaction);
      }
    });

    it('returns the valid transactions', () => {
      expect(transactionPool.validTransactions()).toEqual(validTransactions);
    });

    it('logs errors for the invalid transactions ', () => {
      transactionPool.validTransactions();
      expect(errorMock).toHaveBeenCalled();
    });

  });
});
