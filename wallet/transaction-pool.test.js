const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('.');
const Blockchain = require('../blockchain');

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

  describe('clear()', () => {
    it('clears the transaction pool', () => {
      transactionPool.clear();
      expect(transactionPool.transactionMap).toEqual({});
    });
  });

  describe('clearBlockchainTransactions()', () => {
    it('clears the pool of any existing any blockchain transactions', () => {
      /**
       * This test shall verify that `clearBlockchainTransactions()` function is
       * clearing all the already pushed transaction to the blockchain.
       */
      /* ARRANGE  */
      const blockchain = new Blockchain();
      const expectedTransactionMap = {};

      for(let i=0; i<6; i++) {
        const transaction = new Wallet().createTransaction({
          recipient:'foo',
          amount : 20
        });

        /**
         * Add all the generated transactions to the local pool
         */
        transactionPool.setTransaction(transaction);

        /**
         * Fill the blockchain with even for loop iteration transactions,
         * and let the remaining (odd transactions) to be expected to remain in the local pool
         */
        if(i%2 == 0) {
          blockchain.addBlock({ data: [transaction] });
        } else {
          expectedTransactionMap[transaction.id] = transaction;
        }
      }

      /* ACT */
      transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });

      /* ASSERT */
      expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
    });
  });
});
