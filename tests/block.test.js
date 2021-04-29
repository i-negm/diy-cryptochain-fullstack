const hexToBinary = require('hex-to-binary');
const Block = require('../src/block');
const { MINE_RATE, GENESIS_DATA } = require('../config/config');
const cryptoHash = require('../src/crypto-hash');

describe('Block', () => {
  const timestamp = 2000;
  const lastHash = 'foo-hash';
  const hash = 'bar-hash';
  const data = ['blockchain', 'data'];
  const nonce = 1;
  const difficulty = 1;
  const block = new Block({ timestamp, hash, lastHash, data, nonce, difficulty });


  it('has a timestamp, lasthash, hash, data, nonce and difficulty properties', () => {
    expect(block.timestamp).toEqual(timestamp);
    expect(block.lastHash).toEqual(lastHash);
    expect(block.hash).toEqual(hash);
    expect(block.data).toEqual(data);
    expect(block.nonce).toEqual(nonce);
    expect(block.difficulty).toEqual(difficulty);
  });

  describe('genesis()', () => {
    const genesisBlock = Block.genesis();

    it('returns a Block instance', () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });

    it('returns the genesis data', () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });

  describe('mineBlock()', () => {
    const lastBlock = Block.genesis();
    const data = 'mined-data';
    const minedBlock = Block.mineBlock({ lastBlock, data });

    it('returns a Block instance', () => {
      expect(minedBlock instanceof Block).toBe(true);
    });

    it('sets the `lastHash` to be the `hash` of `lastBlock`', () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });

    it('sets the `data`', () => {
      expect(minedBlock.data).toEqual(data);
    });

    it('sets a `timestamp`', () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });

    it('creates a sha265 hash based on the proper inputs', () => {
      expect(minedBlock.hash)
        .toBe(
          cryptoHash(
            minedBlock.timestamp,
            lastBlock.hash,
            data,
            minedBlock.nonce,
            minedBlock.difficulty
          )
        );
    });

    it('sets a `hash` that matches the difficulty criteria', () => {
      expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty))
        .toEqual('0'.repeat(minedBlock.difficulty));
    });

    it('adjusts the difficulty', () => {
      const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];
      expect( possibleResults.includes(minedBlock.difficulty) ).toBe( true );
    });

  });

  describe('adjustDifficulty()', () => {

    it('raised the difficulty for a quickly mined block', () => {
      const simulatedTimeStampOfNewBlock = block.timestamp + MINE_RATE - 100; // Lower than the MINE_RATE
      expect(Block.adjustDifficulty({
        originalBlock : block,
        timestamp : simulatedTimeStampOfNewBlock
      })).toBe(block.difficulty + 1);
    });
    
    it('lowers the difficulty for a slowly mined block', () => {
      const simulatedTimeStampOfNewBlock = block.timestamp + MINE_RATE + 100; // More than the MINE_RATE
      expect(Block.adjustDifficulty({
        originalBlock : block,
        timestamp : simulatedTimeStampOfNewBlock
      })).toBe(block.difficulty - 1);
    });

    it('has a lower limit of 1', () => {
      block.difficulty = -1;
      expect(Block.adjustDifficulty({originalBlock: block })).toBe(1);
    });

  });
});