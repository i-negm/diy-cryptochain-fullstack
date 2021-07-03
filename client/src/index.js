import React from 'react';
import ReactDOM from 'react-dom';
import {Router, Switch, Route} from 'react-router-dom';

import './index.css';
import history from './components/history';
import Navbar from './components/Navbar';
import App from './App';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction';
import reportWebVitals from './reportWebVitals';
import TransactionPool from './components/TransactionPool';

ReactDOM.render(
  <div className="container">
    <Navbar />
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={App} />
        <Route path="/blocks" component={Blocks} />
        <Route path="/conduct-transaction" component={ConductTransaction} />
        <Route path="/transaction-pool" component={TransactionPool} />
      </Switch>
    </Router>
  </div>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
