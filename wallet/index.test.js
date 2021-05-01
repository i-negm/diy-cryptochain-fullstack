const Wallet = require('./index');
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

});