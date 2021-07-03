const express = require('express');
const cors = require('cors');
const request = require('request');
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const { response } = require('express');
const TransactionMiner = require('./app/transaction-miner');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({ blockchain, transactionPool });
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, wallet, pubsub });

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
/**
 * Express Middle Ware Initialization
 */
app.use(bodyParser.json());
app.use(cors());

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
  let transaction = transactionPool.existingTransaction({inputAddress : wallet.publicKey});
  try {
    if (transaction) {
      transaction.update({senderWallet: wallet, recipient, amount});
    } else {
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain
      });
    }
  } catch(err) {
    console.error('[ERROR] /api/transact', err.message);
    return res.status(400).json({ type: "error", message: err.message });
  }
  transactionPool.setTransaction(transaction);
  console.log('transactionPool', transactionPool);
  pubsub.broadcastTransaction(transaction);
  res.json({ type: "success", transaction });
});

app.get('/api/transaction-pool-map', (req, res) => {
  res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
  transactionMiner.mineTransactions();
  res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
  const address = wallet.publicKey;
  res.json({
    address,
    "balance": Wallet.calculateBalance({
      chain: blockchain.chain,
      address
    })
  });
});

const synchWithSeedNodes = () => {
  /**
   * Sync the blockchain 
   */
  request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(body);
      console.log('[DEBUG] Replace chain on sync with', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });
  /**
   * Sync the transaction pool
   */
  request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootTransactionMap = JSON.parse(body);
      console.log(`[DEBUG] Sync the transaction pool from seed nodes`, rootTransactionMap);
      transactionPool.replaceTransactionPool(rootTransactionMap);
    }
  });
};

/**
 * @todo to be removed in production
 * @group seed_dev
 * @{
 */
/* Seeding the blockchain */
const walletFoo = new Wallet();
const walletBar = new Wallet();

const generateWalletTransaction = ({ wallet, recipient, amount }) => {
  const transaction = wallet.createTransaction({
    recipient, amount, chain: blockchain.chain
  });
  transactionPool.setTransaction(transaction);
} 

/* Helper functions */
const walletAction = () => generateWalletTransaction({ wallet, recipient: walletFoo.publicKey, amount: 5 });
const walletFooAction = () => generateWalletTransaction({ wallet: walletFoo, recipient: walletBar.publicKey, amount: 10 });
const walletBarAction = () => generateWalletTransaction({ wallet: walletBar, recipient: wallet.publicKey, amount: 15 });

/* Generating the transactions */
for (let i=0; i<10; i++) {
  if (i%3 === 0) {
    walletAction();
    walletFooAction();
  } else if (i%3 === 1) {
    walletAction();
    walletBarAction();
  } else {
    walletFooAction();
    walletBarAction();
  }

  /* Add the transactions to the blockchain */
  transactionMiner.mineTransactions();
}

/**
 * @}
 */

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
    synchWithSeedNodes();
  }

});