import React, { Component } from 'react';

export default class Transaction extends Component {

  render() {
    const transaction = this.props.transaction;
    const transactionId = transaction.id;

    const timestamp = transaction.input.timestamp;
    const outputKeys = Object.keys(transaction.outputMap);

    console.log(transaction);

    return (
      <div className="accordion-item">
        <h2 className="accordion-header" id={"panelsStayOpen-" + transactionId}>
          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={"#panelsStayOpen-collapse" + transactionId} aria-expanded="false" aria-controls={"panelsStayOpen-collapse" + transactionId}>
            💲 Transaction - {transactionId.substring(0, 13)}
          </button>
        </h2>
        <div id={"panelsStayOpen-collapse" + transactionId} className="accordion-collapse collapse" aria-labelledby={"panelsStayOpen-" + transactionId}>
          <div className="accordion-body">
            <div><strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}</div>
            <div><strong>From:</strong> {transaction.input.address.substring(0, 15)}</div>
            <div><strong>Balance:</strong> {transaction.input.amount}</div>
            
            <div><strong>To:</strong> {transaction.input.amount}</div>
            <ul>
              {
                Object.values(transaction.outputMap).map( (outputValue, index) => {
                  return (<li key={index}>{outputKeys[index].substring(0,15)} = {outputValue}</li>);
                })
              }
            </ul>

          </div>
        </div>
      </div>
    )
  }
}