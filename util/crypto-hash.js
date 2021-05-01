const crypto = require('crypto'); 

const cryptoHash = (...inputs) => {
  const hash = crypto.createHash('sha256');
  const sortedStringifiedInputs = inputs
    .sort()
    .map((ele) => JSON.stringify(ele));

  hash.update(sortedStringifiedInputs.join(' '));
  return hash.digest('hex');
};

module.exports = cryptoHash;