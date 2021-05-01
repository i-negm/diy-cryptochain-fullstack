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

  describe('update()', () => {
    let originalSignature, origianlSenderOutputAmount, nextRecipient, nextAmount;

    beforeEach(() => {
      originalSignature = transaction.input.signature;
      origianlSenderOutputAmount = transaction.outputMap[senderWallet.publicKey];
      nextRecipient = 'next-recipient';
      nextAmount = 50;

      transaction.update({
        senderWallet, recipient: nextRecipient, amount: nextAmount
      });
    });

    it('outputs the amount to the next recipient', () => {
      expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
    });

    it('subtracts the amount from the original sender output amount', () => {
      expect(transaction.outputMap[senderWallet.publicKey])
        .toEqual(origianlSenderOutputAmount - nextAmount);
    });

    it('maintains a total output value that still matches the input amount', () => {
      expect(
        Object.values(transaction.outputMap)
          .reduce((total, outputAmount) => total + outputAmount)
      ).toEqual(transaction.input.amount);
    });

    it('resigns the transaction', () => {
      expect(transaction.input.signature).not.toEqual(originalSignature);
    });

    describe('when sending to same recipient', () => {
      const extraAmountSameRecipient = 70;
      beforeEach(() => {
        // Same recipient
        transaction.update({
          senderWallet, recipient: nextRecipient, amount: extraAmountSameRecipient
        });
      });

      it('adds to the amount', () => {
        expect(transaction.outputMap[nextRecipient])
          .toEqual(nextAmount + extraAmountSameRecipient);
      });

      it('subtracts the amount from the original sender output amount', () => {
        expect(transaction.outputMap[senderWallet.publicKey])
          .toEqual(origianlSenderOutputAmount - nextAmount - extraAmountSameRecipient);
      });

    });
    describe('when the amount is invalid', () => {
      const hugeAmount = 9999999;

      it('it thorws an error', () => {
        expect(() => {
          transaction.update({
            senderWallet, recipient: nextRecipient, amount: hugeAmount
          });
        }).toThrow('Amount exceeds balance.');
      });
    });

  });
});