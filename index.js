const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
/**
 * Express Middle Ware Initialization
 */
app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
  res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  pubsub.broadcastChain();  
  // Redirect the user after sending the data
  res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
  const {amount, recipient} = req.body;
  let transaction;
  try {
    transaction = wallet.createTransaction({ recipient , amount });
  } catch(err) {
    console.error('/api/transact', err.message);
    return res.status(400).json({ type: "error", message: err.message });
  }
  transactionPool.setTransaction(transaction);
  console.log('transactionPool', transactionPool);
  res.json({ type: "success", transaction });
});

const synchChains = () => {
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);
      console.log('[DEBUG] Replace chain on sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });
};

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}
const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log(`Listening at localhost:${PORT}`);

  // If it's the root node, then avoid synching
  if (PORT === DEFAULT_PORT)
  {
    console.log(`[DEBUG] This is the root node, no need to sync the blockchain`);
  } else {
    synchChains();
  }

});