const Wallet = require('./index');
const Transaction = require('./transaction');
const { verifySignature } = require('../util');

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
  });
});