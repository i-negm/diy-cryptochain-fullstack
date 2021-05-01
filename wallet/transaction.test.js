const Transaction = require('./transaction');
const Wallet = require('.');
const { verifySignature } = require('../util');

describe('Transaction', () => {
  let transaction, senderWallet, recipient, amount;

  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = 'recipient-public-key';
    amount = 50;
    transaction = new Transaction({ senderWallet, recipient, amount });
  });

  it('has an `id`', () => {
    expect(transaction).toHaveProperty('id');
  });

  describe('outputMap', () => {
    it('has an `outputMap`', () => {
      expect(transaction).toHaveProperty('outputMap');
    });

    it('outputs the amount to the recipient', () => {
      expect(transaction.outputMap[recipient]).toEqual(amount);
    });

    it('outputs the remaining balance for the `senderWallet`', () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
    });

  });

  describe('input', () => {
    it('has an `input`', () => {
      expect(transaction).toHaveProperty('input');
    });

    it('has a `timestamp` in the input', () => {
      expect(transaction.input).toHaveProperty('timestamp');
    });

    it('sets the `amount` to the `senderWallet` balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance);
    });

    it('sets the `address` to the `senderWallet` publicKey', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey);
    });

    it('signs the input', () => {
      expect(
        verifySignature(
          {
            publicKey: senderWallet.publicKey,
            data: transaction.outputMap,
            signature: transaction.input.signature
          }
        )
      ).toBe(true);
    });
  });

  describe('validate()', () => {
    const errMock = jest.fn();
    global.console.error = errMock;

    describe('when a transaction is valid', () => {
      it('returns `true`', () => {
        expect(Transaction.validate(transaction)).toBe(true);
      });
    });
    
    describe('when a transaction is invalid', () => {
      describe('and the transaction `outputMap` is invalid', () => {
        it('returns `false`', () => {
          // tamper with outputmap amount
          transaction.outputMap[recipient] = 500;
          expect(Transaction.validate(transaction)).toBe(false);
          expect(errMock).toHaveBeenCalled();
        });
      });
      
      describe('and the transaction `inputMap` is invalid', () => {
        it('returns `false`', () => {
          // tamper with input balance
          transaction.input.amount = 10000;
          expect(Transaction.validate(transaction)).toBe(false);
          expect(errMock).toHaveBeenCalled();
        });
      });
      
      describe('and the transaction `input` signature is invalid', () => {
        it('returns `false`', () => {
          // tamper with input signature
          transaction.input.signature = senderWallet.sign('foo-data');
          expect(Transaction.validate(transaction)).toBe(false);
          expect(errMock).toHaveBeenCalled();
        });
      });

      describe('and the `recipient` has been tampered', () => {
        it('returns `false`', () => {
          // tamper with input signature
          delete transaction.outputMap[recipient];
          transaction.outputMap['new-foo-recipient'] = 50;

          expect(Transaction.validate(transaction)).toBe(false);
          expect(errMock).toHaveBeenCalled();
        });
      });
    });
  });
});