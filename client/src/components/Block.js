import React, {Component} from 'react';


class Block extends Component {
  render() {
    const {timestamp, hash, data, nonce, difficulty} = this.props.block;
    const {blockIndex, chainLength} = this.props.metaData;

    const hashDisplay = `${hash.substring(0, 15)}...`;
    const blockHash =  hash ? hash.substring(0,15): hash; ;

    const stringifiedData = JSON.stringify(data, null, 4);
    // const dataDisplay = stringifiedData.length > 35? `${stringifiedData.substring(0, 35)}...`: stringifiedData;
    const dataDisplay = stringifiedData;

    return(
      <div className="accordion-item">
        <h2 className="accordion-header" id={"panelsStayOpen-" + blockHash}>
          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={"#panelsStayOpen-collapse" + blockHash} aria-expanded="false" aria-controls={"panelsStayOpen-collapse" + blockHash}>
            🧱 Block#{chainLength - blockIndex} - {blockHash}
          </button>
        </h2>
        <div id={"panelsStayOpen-collapse" + blockHash} className="accordion-collapse collapse" aria-labelledby={"panelsStayOpen-" + blockHash}>
          <div className="accordion-body">
            <div><strong>timestamp:</strong> {new Date(timestamp).toLocaleString()}</div>
            <div><strong>Hash:</strong> {hash}</div>
            <div><strong>Nonce:</strong> {nonce}</div>
            <div><strong>Difficulty:</strong> {difficulty}</div>
            <div><strong>Data:</strong> <pre>{dataDisplay}</pre></div>
          </div>
        </div>
      </div>
    )

  }
}

export default Block;
