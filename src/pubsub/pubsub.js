const redis = require('redis');

const CHANNELS = {
  TEST : 'TEST',
  BLOCKCHAIN : 'BLOCKCHAIN'
};

class PubSub {
  constructor ({ blockchain }) {
    // For each PubSub instance, there is a local blockchain attached to it
    this.blockchain = blockchain;

    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();

    this.subscribeToChannel();

    // Add event handler for the subscribtion
    this.subscriber.on('message', (channel, message) => {
      this.handleMessage(channel, message);
    });
  }

  publish({ channel, message }) {
    this.publisher.publish(channel, message);
  }

  handleMessage(channel, message) {
    console.log(`channel : ${channel}`);
    console.log(`message : ${message}`);

    const parsedMessage = JSON.parse(message);

    if(channel === CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(parsedMessage);
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
}

module.exports = PubSub;
