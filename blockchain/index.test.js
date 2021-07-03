const Blockchain = require('./index');
const Block = require('./block');
const { cryptoHash } = require("../util");
const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');


describe('Blockchain', () => {
  let blockchain = null;
  let newChain = null;
  let errorMock = null;

  beforeEach(() => {
    blockchain = new Blockchain();
    errorMock = jest.fn();
    global.console.error = errorMock;
  });

  it('contains a `chain` Array instance', () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });

  it('starts with the genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block to the chain', () => {
    const newData = 'foo bar';
    blockchain.addBlock({ data: newData });

    // Assert
    expect(blockchain.chain[blockchain.chain.length - 1].data)
      .toEqual(newData);
  });


  describe('isValidChain()', () => {
    describe('when the chain does not start with the genesis block', () => {
      it('returns false', () => {
        blockchain.chain[0] = { data: 'fake-genesis' };
        expect(Blockchain.isValidChain(blockchain.chain))
          .toBe(false);
      });
    });
    describe('when the chain start with the genesis block and has multiple blocks', () => {

      beforeEach(() => {
        // Arrange
        blockchain = new Blockchain();
        blockchain.addBlock({ data: 'Bears' });
        blockchain.addBlock({ data: 'Beets' });
        blockchain.addBlock({ data: 'Battlestar Galactica' });
      });

      describe('and a lastHash reference has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'broken-lastHash';
          // Assert
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain contains a block of invalid fields', () => {
        it('returns false', () => {
          blockchain.chain[2].data = 'some-bad-and-evil-data';
          // Assert
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe('and the chain does not contain any invalid blocks', () => {
        it('returns true', () => {
          // Assert
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });

      describe('and the chain contains a block with a jumped difficulty', () => {
        it('returns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const data = [];
          const timestamp = Date.now();
          const nonce = 0;
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash(timestamp, lastHash, nonce, difficulty, data);
          // Create the badblock (with jumped difficulty level)
          const badBlock = new Block({ timestamp, lastHash, hash, nonce, difficulty, data });

          blockchain.chain.push(badBlock);

          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

    });
  });

  describe('replaceChain()', () => {
    let originalChain = null;
    let logMock = null;

    beforeEach(() => {
      blockchain = new Blockchain();
      newChain = new Blockchain();
      // Prepare both the chains with the same data
      blockchain.addBlock({ data: 'Bears' });
      blockchain.addBlock({ data: 'Beets' });
      newChain.addBlock({ data: 'Bears' });
      newChain.addBlock({ data: 'Beets' });
      originalChain = blockchain.chain;
      // Stub the log functions
      logMock = jest.fn();
      global.console.log = logMock ;
    });

    describe('when the new chain is not longer', () => {
      it('does not replace the original chain', () => {
        // differentiate the new chain fromt the original, by altering the new chain
        newChain.chain[0] = { new : 'different' };
        blockchain.replaceChain(newChain.chain);
        expect(blockchain.chain).toEqual(originalChain);
      });
      it('logs an error', () => {
        blockchain.replaceChain(newChain.chain);
        expect(errorMock).toHaveBeenCalled();
      });
    });

    describe('when the new chain is longer', () => {
      beforeEach(() => {
        // Add more block to the new chain
        newChain.addBlock({ data: 'Battlestar Galactica' });
      });

      describe('and is invalid chain', () => {
        it('does not replace the chain', () => {
          newChain.chain[2].hash = 'some-fake-hash';
          blockchain.replaceChain(newChain.chain);
          expect(blockchain.chain).toEqual(originalChain);
        });
      });
      describe('and is valid chain', () => {
        it('replaces the chain', () => {
          blockchain.replaceChain(newChain.chain);
          expect(blockchain.chain).toEqual(newChain.chain);
        });
      });
    });

    describe('and `validateTransactions` flag is true', () => {
      it('calls validTransactionData()', () => {
        const validTransactionDataMock = jest.fn();
        blockchain.validTransactionData = validTransactionDataMock;

        newChain.addBlock({ data: 'foo' });
        blockchain.replaceChain(newChain.chain, true);
        expect(validTransactionDataMock).toHaveBeenCalled();
      });
    });
  });

  describe('validTransactionData()', () => {
    let transaction, rewardTransaction, wallet;

    beforeEach(() => {
      wallet = new Wallet();
      newChain = new Blockchain();
      transaction = wallet.createTransaction({ recipient:'foo-address', amount: 65 });
      rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
    });

    describe('and the transaction data is valid', () => {
      it('returns `true`', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
        expect(errorMock).not.toHaveBeenCalled();
      });
    });

    describe('and the transaction data has multiple rewards', () => {
      it('returns `false` and logs an error', () => {
        newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });
    
    describe('and the transaction data has at least one malformed `outputMap`', () => {
      describe('and the transaction is not a reward transaction', () => {
        it('returns `false` and logs an error', () => {
          transaction.outputMap[wallet.publicKey] = 999999 ; /* Invalid output map (remaining balance of a wallet) */
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          
          expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
      describe('and the transaction is a reward transaction', () => {
        it('returns `false` and logs an error', () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999; /* Invalid output map (tampered input balance to the wallet) */
          newChain.addBlock({ data: [transaction, rewardTransaction] });
          
          expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
    
    describe('and the transaction data has at least one malformed `input`', () => {
      it('returns `false` and logs an error', () => {
        wallet.balance = 9000; /* malformed balance (input) */
        
        const evilOutputMap = {
          [wallet.publicKey] : 8900,
          fooRecipient: 100
        };
        
        const evilTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(evilOutputMap)
          },
          outputMap: evilOutputMap
        };
        
        newChain.addBlock({ data: [evilTransaction, rewardTransaction] });
        
        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });
    
    describe('and a block contains multiple identical transactions', () => {
      it('returns `false` and logs an error', () => {
        newChain.addBlock({ data: [transaction, transaction, transaction, rewardTransaction] });

        expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
        expect(errorMock).toHaveBeenCalled();
      });
    });
  });
});
