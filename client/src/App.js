import React , {Component} from 'react';

import Blocks from './components/Blocks';
import Navbar from './components/Navbar';

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
        <Navbar />
        <br />
        <div className="row">
          <div className="col-3">

            <div class="card">
              <div class="card-body">
                <h5 class="card-title">💳 My wallet </h5>
                <p class="card-text">Address: {address? address.substring(0,11): address} </p>
                <p class="card-text">Balance: {balance} </p>
              </div>
            </div>
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
