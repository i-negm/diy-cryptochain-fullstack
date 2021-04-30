const Blockchain = require('./index');
const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');


describe('Blockchain', () => {
  let blockchain = null;

  beforeEach(() => {
    blockchain = new Blockchain();
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
      .toBe(newData);
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
    let newChain = null, originalChain = null;
    let errorMock = null, logMock = null;

    beforeEach(() => {
      blockchain = new Blockchain();
      newChain = new Blockchain();
      // Prepare both the chains with the same data
      blockchain.addBlock({ data: 'Bears' });
      blockchain.addBlock({ data: 'Beets' });
      newChain.addBlock({ data: 'Bears' });
      newChain.addBlock({ data: 'Beets' });
      originalChain = blockchain.chain;
      // Stub the log and error functions
      errorMock = jest.fn();
      logMock = jest.fn();
      global.console.error = errorMock ;
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
  });
});
