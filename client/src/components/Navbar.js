import React, { Component } from 'react';

import { Nav, Navbar } from 'react-bootstrap';
import logo from './../logo.png';

class NavigationBar extends Component {
  render() {
    return (
      <>
        <Navbar bg="dark" variant="dark">
          <Navbar.Brand href="#home">
            <img
              src={logo}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="React Bootstrap logo"
            />
          </Navbar.Brand>
          <Nav className="mr-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/blocks">Blocks</Nav.Link>
            <Nav.Link href="/conduct-transaction">Conduct Transaction</Nav.Link>
            <Nav.Link href="/transaction-pool">Transaction Pool</Nav.Link>
          </Nav>
        </Navbar>
      </>
    );
  }
}

export default NavigationBar;