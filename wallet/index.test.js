const Wallet = require('./index');
const Transaction = require('./transaction');
const { verifySignature } = require('../util');
const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {
  let wallet;

  beforeEach(() => {
    wallet = new Wallet();
  });

  it('has a `balance`', () => {
    expect(wallet).toHaveProperty('balance');
  });

  it('has a `publicKey`', () => {
    expect(wallet).toHaveProperty('publicKey');
  });

  describe('sigining data', () => {
    const data = 'some-data';

    it('verifies signature', () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data)
        })).toBe(true);
    });

    it('does not verify an invalid signature', () => {
      expect( verifySignature({
        publicKey: wallet.publicKey,
        data,
        signature: new Wallet().sign(data)
      }) ).toBe(false);
    });

  });

  describe('createTransaction()', () => {
    describe('when the amount is valid', () => {
      let transaction, amount, recipient;

      beforeEach(() => {
        amount = 50;
        recipient = 'foo-recipient';
        transaction = wallet.createTransaction({ amount, recipient });
      });

      it('creates an instance of `Transaction`', () => {
        expect(transaction instanceof Transaction).toBe(true);
      });
      
      it('matches the transaction `input` with the calling `wallet`', () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });

      it('outputs the amount to the recipient', () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });

    describe('when the amount exceeds the balanace', () => {
      it('throws an error', () => {
        expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' }))
          .toThrow('Amount exceeds balance.');
      });
    });

    describe('and a chain is passed', () => {
      it('calls `Wallet.calculateBalance()`', () => {
        /* Arrange */
        const calculateBalanceMock = jest.fn();
        const originalCalculateBalance = Wallet.calculateBalance;
        Wallet.calculateBalance = calculateBalanceMock;

        /* Act */
        wallet.createTransaction({
          recipient: 'foo',
          amount: 10,
          chain: new Blockchain().chain
        });

        /* Assert */
        expect(calculateBalanceMock).toHaveBeenCalled();

        /* Return back the original function instead of mock to avoid failing tests */
        Wallet.calculateBalance = originalCalculateBalance;
      });
    });
  });

  describe('calculateBalance()', () => {
    let blockchain ;

    beforeEach(() => {
      blockchain = new Blockchain();
    });

    describe('and there are no outputs for the wallet', () => {
      it('returns the `STARTING_BALANCE`', () => {
        expect(
          Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })
          ).toEqual(STARTING_BALANCE);
      });
    });

    describe('and there are outputs for the wallet', () => {
      let transactionOne, transactionTwo;

      beforeEach(() => {
        transactionOne = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 50
        });
        transactionTwo = new Wallet().createTransaction({
          recipient: wallet.publicKey,
          amount: 60
        });

        blockchain.addBlock({ data: [transactionOne, transactionTwo] });

      });

      it('adds the sum of all outputs to the wallet balance', () => {
        expect(
          Wallet.calculateBalance({
          chain: blockchain.chain,
          address: wallet.publicKey
        })).toEqual(
          STARTING_BALANCE +
          transactionOne.outputMap[wallet.publicKey] +
          transactionTwo.outputMap[wallet.publicKey]
          );
      });
    });

    describe('and the wallet has made a transaction', () => {
      let recentTransaction;
      beforeEach(() => {
        recentTransaction = wallet.createTransaction({
          recipient: 'foo',
          amount: 20,
          chain: blockchain.chain
        });

        blockchain.addBlock({ data: [recentTransaction] });
      });

      it('returns the output amount of the recent transaction', () => {
        expect(
          Wallet.calculateBalance({ chain: blockchain.chain, address: wallet.publicKey })
        ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
      });

      describe('and there are outputs next to and after the recent transactions', () => {
        let sameBlockTransaction, nextBlockTransaction;

        beforeEach(() => {
          /* wallet -> sends amount  */
          recentTransaction = wallet.createTransaction({
            recipient: 'later-foo-address',
            amount: 60
          });
          /* wallet <- receives reward (in same block)  */
          sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
          blockchain.addBlock({ data: [recentTransaction, sameBlockTransaction] });

          /* wallet <- receives amount from another wallet (in next block) */
          nextBlockTransaction = new Wallet().createTransaction({
            recipient: wallet.publicKey,
            amount: 75
          });
          blockchain.addBlock({ data: [nextBlockTransaction]} );
        });

        it('includes the output amounts in the returned balance', () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey
            })).toEqual(
              recentTransaction.outputMap[wallet.publicKey] +
              sameBlockTransaction.outputMap[wallet.publicKey] +
              nextBlockTransaction.outputMap[wallet.publicKey]
            );
        });

      });
    });
  });
});