import React, {Component} from 'react';


class Block extends Component {
  render() {
    const {timestamp, hash, data} = this.props.block;
    const {blockIndex, chainLength} = this.props.metaData;

    const hashDisplay = `${hash.substring(0, 15)}...`;
    const blockHash =  hash ? hash.substring(0,15): hash; ;

    const stringifiedData = JSON.stringify(data);
    const dataDisplay = stringifiedData.length > 35? `${stringifiedData.substring(0, 35)}...`: stringifiedData;

    return(
      <div className="accordion-item">
        <h2 className="accordion-header" id={"panelsStayOpen-" + blockHash}>
          <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={"#panelsStayOpen-collapse" + blockHash} aria-expanded="false" aria-controls={"panelsStayOpen-collapse" + blockHash}>
            🧱 Block#{chainLength - blockIndex} - {blockHash}
          </button>
        </h2>
        <div id={"panelsStayOpen-collapse" + blockHash} className="accordion-collapse collapse" aria-labelledby={"panelsStayOpen-" + blockHash}>
          <div className="accordion-body">
            <div>Hash: {hashDisplay}</div>
            <div>timestamp: {new Date(timestamp).toLocaleString()}</div>
            <div>Data: {dataDisplay}</div>
          </div>
        </div>
      </div>
    )

  }
}

export default Block;
