import React, {Component} from 'react';

import logo from './../logo.png';

class Navbar extends Component {
  render() {
    return(
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src={logo} alt="" width="30" height="30" className="d-inline-block align-text-top"  />
             Crypto Blockchain
          </a>
        </div>
      </nav>
    );
  }
}

export default Navbar;