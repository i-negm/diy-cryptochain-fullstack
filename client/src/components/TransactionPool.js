import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Button } from 'react-bootstrap';

import Transaction from './Transaction';

export default class TransactionPool extends Component {

  state = { transactionPoolMap: null };

  fetchTransactionPoolMap = () => {
    fetch('http://localhost:3000/api/transaction-pool-map')
      .then(res => res.json())
      .then(json => this.setState({ transactionPoolMap: json }));
  }

  componentDidMount() {
    this.fetchTransactionPoolMap();
  }

  mineBlock() {
    fetch('http://localhost:3000/api/mine-transactions')
      .then(res => res.json())
      .then(json => alert( json.message ));
  }

  render() {
    if (this.state.transactionPoolMap) {
      return (
        <div className='TransactionPool'>
          <div><Link to='/'>Home</Link></div>
          <Button variant="success" onClick={this.mineBlock}>Mine Block</Button>
          <div className="accordion" id="blockchain-blocks">
            <h3>Transaction Pool</h3>
            {
              Object.values(this.state.transactionPoolMap).map(transaction => {
                return (
                  <Transaction key={transaction.id} transaction={transaction} />
                )
              })
            }
          </div>
        </div>
      );
    } else {
      return (<div></div>);
    }
  }
}
