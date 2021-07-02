const redis = require('redis');

const CHANNELS = {
  TEST : 'TEST',
  BLOCKCHAIN : 'BLOCKCHAIN',
  TRANSACTION: 'TRANSACTION'
};

class PubSub {
  constructor ({ blockchain, transactionPool }) {
    // For each PubSub instance, there is a local blockchain attached to it
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;

    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscribeToChannel();

    // Add event handler for the subscription
    this.subscriber.on('message', (channel, message) => {
      this.handleMessage(channel, message);
    });
  }

  publish({ channel, message }) {
    this.subscriber.unsubscribe(channel, () => {
      this.publisher.publish(channel, message, () => {
        this.subscriber.subscribe(channel);
      });
    });
  }

  handleMessage(channel, message) {
    console.log(`channel : ${channel}`);
    console.log(`message : ${message}`);

    const parsedMessage = JSON.parse(message);

    switch (channel) {
      case CHANNELS.BLOCKCHAIN:
        this.blockchain.replaceChain(parsedMessage, () => {
          /** 
           * Synching the local transaction pool with the blockchain
           * transaction pool by removing the transactions that has 
           * been pushed to the new received blockchain.
           */
          console.log("Synching the transaction pool.");
          this.transactionPool.clearBlockchainTransactions({ chain: parsedMessage });
        });
        break;
      case CHANNELS.TRANSACTION:
        this.transactionPool.replaceTransactionPool(parsedMessage);
        break;
      default:
        throw new Error("Wrong channel");
        break;
    }
  }

  subscribeToChannel() {
    Object.values(CHANNELS).forEach((channel) => {
      this.subscriber.subscribe(channel);
    })
  }

  broadcastChain() {
    this.publish({
      channel : CHANNELS.BLOCKCHAIN,
      message : JSON.stringify(this.blockchain.chain)
    })
  }

  broadcastTransaction() {
    this.publish({
      channel: CHANNELS.TRANSACTION,
      message : JSON.stringify(this.transactionPool.transactionMap)
    });
  }
}

module.exports = PubSub;
