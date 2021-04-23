const Blockchain = require('./blockchain');
const Block = require('./block');

let blockchain = null;

describe('Blockchain', () => {

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

    });
  });

});
