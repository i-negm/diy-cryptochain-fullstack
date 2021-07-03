import React, {Component} from 'react';

class Blocks extends Component {

  state = { blocks: [] };

  componentDidMount() {
    fetch('http://localhost:3000/api/blocks')
      .then( res => res.json() )
      .then( json => this.setState({ blocks: json }) );
  }

  render() {
    console.log("this.state", this.state);
    return(
      <div className="accordion" id="blockchain-blocks">
        <h3>Blocks</h3>
        {
          this.state.blocks.reverse().map((block, index, blocks) => {
            const blockHash = block.hash ? block.hash.substring(0, 11) : block.hash;
            return(
              <div key={blockHash} className="accordion-item">
                <h2 className="accordion-header" id={"panelsStayOpen-" + blockHash}>
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={"#panelsStayOpen-collapse" + blockHash} aria-expanded="false" aria-controls={"panelsStayOpen-collapse" + blockHash}>
                    🧱 Block#{blocks.length - index} - {blockHash}
                  </button>
                </h2>
                <div id={"panelsStayOpen-collapse" + blockHash} className="accordion-collapse collapse" aria-labelledby={"panelsStayOpen-" + blockHash}>
                  <div className="accordion-body">
                    <strong>This is the first item's accordion body.</strong> It is shown by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions. You can modify any of this with custom CSS or overriding our default variables. It's also worth noting that just about any HTML can go within the <code>.accordion-body</code>, though the transition does limit overflow.
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>
    );
  }
}

export default Blocks;
