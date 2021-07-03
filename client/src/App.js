import React , {Component} from 'react';

import Blocks from './components/Blocks';

class App extends Component {

  state = { walletInfo: {} };

  componentDidMount() {
    fetch('http://localhost:3000/api/wallet-info')
      .then( response => response.json())
      .then( json => this.setState({ walletInfo: json }) );
  }

  render() {
    const {address, balance} = this.state.walletInfo;
    return (
      <div className="container">
        <div className="row">
          <div className="col-3">
            <div> Address {address? address.substring(0,11): address} </div>
            <div> Balance {balance} </div>
          </div>
          <div className="col-9">
            <Blocks />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
