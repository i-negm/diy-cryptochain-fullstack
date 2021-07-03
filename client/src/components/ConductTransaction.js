import React, { Component } from 'react';
import { Button, Form, FormGroup, FormControl } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default class ConductTransaction extends Component {

  state = { recipient: '', amount: 0 };

  updateRecipient = event => {
    this.setState({ recipient: event.target.value });
  }
  updateAmount = event => {
    this.setState({ amount: Number(event.target.value) });
  }

  conductTransaction = () => {
    const { recipient, amount } = this.state;

    fetch('http://localhost:3000/api/transact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, amount })
    })
      .then(res => res.json())
      .then(json => {
        alert(json.message || json.type);
      });
  }

  render() {

    console.log('this.state', this.state);

    return (
      <div className='ConductTransaction'>
        <Link to='/'>Home</Link>
        <h3>Conduct a Transaction</h3>
        <Form>

          <FormGroup>
            <Form.Label>Recipient (PubKey):</Form.Label>
            <FormControl
              type='text'
              placeholder='recipient public key'
              value={this.state.recipient}
              onChange={this.updateRecipient}
            />
            <Form.Text className="text-muted">
              e.g. : 04c4e3c21687317fdba8f954b3ecce4260e20ff7ced6b7fc475322a53dbe6af36a15f1ede9deff20adb92909ec9a663d1502f2453c3fe8161a2452daca16a48d57
            </Form.Text>
          </FormGroup>

          <FormGroup>
            <Form.Label>Amount:</Form.Label>
            <FormControl
              type='number'
              placeholder='10'
              value={this.state.amount}
              onChange={this.updateAmount}
            />
          </FormGroup>

          <div>
            <Button
              variant="danger"
              onClick={this.conductTransaction}
              >Submit</Button>
          </div>

        </Form>
      </div>
    );
  }

}