const redis = require('redis');

const CHANNEL = {
  TEST : 'TEST'
};

class PubSub {
  constructor () {
    this.publisher = redis.createClient();
    this.subscriber = redis.createClient();
    // Subscribe to a specific channel
    this.subscriber.subscribe(CHANNEL.TEST);
    // Add event handler for the subscribtion
    this.subscriber.on('message', PubSub.handleMessage);
  }

  publish() {
    this.publisher.publish(CHANNEL.TEST, 'Hello redis');
  }

  static handleMessage(channel, message) {
    console.log(`channel : ${channel}`);
    console.log(`message : ${message}`);
  }
}

const pubsub = new PubSub();
setTimeout(() => pubsub.publish(), 1000);