/** 
 * MINE_RATE
 * @brief Initial Mine rate in milliseconds
 */
const MINE_RATE = 1000;
const INITIAL_DIFFICULTY = 4;

const GENESIS_DATA = {
  timestamp : 1,
  lastHash : '----',
  hash : 'hash-one',
  data : [],
  difficulty : INITIAL_DIFFICULTY,
  nonce : 0
};

module.exports = { GENESIS_DATA, MINE_RATE };
