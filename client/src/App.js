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
      <div className="row">
          <div className="col-3">

            <div className="card">
              <div className="card-body">
                <h5 className="card-title">💳 My wallet </h5>
                <p className="card-text">Address: {address? address.substring(0,11): address} </p>
                <p className="card-text">Balance: {balance} </p>
              </div>
            </div>
          </div>

          <div className="col-9">
            <Blocks />
          </div>
        </div>
    );
  }
}

export default App;
