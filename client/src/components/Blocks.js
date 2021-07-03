import React, {Component} from 'react';

import Block from './Block';

class Blocks extends Component {

  state = { blocks: null };

  componentDidMount() {
    fetch('http://localhost:3000/api/blocks')
      .then( res => res.json() )
      .then( json => this.setState({ blocks: json }) );
  }

  render() {
    console.log("this.state", this.state);
    if (this.state.blocks) {
      return (
        <div className="accordion" id="blockchain-blocks">
          <h3>Blocks</h3>
          {
            this.state.blocks.reverse().map((block, index, blocks) => {
              const blockHash = block.hash ? block.hash.substring(0, 15) : block.hash;
              const metaData = {blockIndex: index, chainLength: blocks.length};
              return (
                <Block key={blockHash} block={block} metaData={metaData} />
              );
            })
          }
        </div>
      );
    }
    else {
      return(<div></div>);
    }
  }
}

export default Blocks;
