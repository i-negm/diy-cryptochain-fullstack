const EC = require('elliptic').ec;
const cryptoHash = require('./crypto-hash');

/**
 * secp256k1
 *  - Used by bitcoin
 *  - sec : Standard of Effecient Cryptography
 *  - p : stands for prime (crucial step in elliptic curve algorithm to generate the curve)
 *  - 256 : width (in bits) of the prime number
 *  - k : Koblits (name of the scientest who significantly contributed to this alogrithm)
 *  - 1 : Very first implementation of this algorithm
 */
const ec = new EC('secp256k1'); 

const verifySignature = ({ publicKey, data, signature }) => {
  const keyFromPublic = ec.keyFromPublic(publicKey, 'hex');
  return keyFromPublic.verify(
    cryptoHash(data), signature
  );
};

module.exports = { ec, verifySignature, cryptoHash };
