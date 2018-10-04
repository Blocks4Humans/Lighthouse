import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import ContractFormCreate from '../../components/ContractFactory/ContractFormCreate'
import {idCreating} from '../../actions/create/updateWallet';
import QRCode from 'qrcode.react';

//import { channelCreating } from '../../actions/whisper/channelCreate';
//import SuccessSnackbar from '../../components/SuccessSnackbar';
//import WarningSnackbar from '../../components/WarningSnackbar';

class Home extends Component {
  componentDidMount() {
    try {
      this.props.createId();
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    let buf = new Buffer(JSON.stringify({ address: this.props.owner, walletAddress: this.props.walletAddress }));
    let base64 = buf.toString('base64');
    let QrString = 'May the Force be with you.\n'+ base64;
    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1 header">
            <h1>LIGHTHOUSE</h1>
            <br/><br/>
          </div>
          <div className="pure-u-1-1">
            <div className="pure-u-1-1">
            <p><strong>Emitter Account: </strong></p>{this.props.accounts[0]}
            <p><strong>Identity Owner: {this.props.owner}</strong></p>
            <h2>Wallet Factory</h2>
            <p>Wallet Address: {this.props.walletAddress}</p>
            <ContractFormCreate 
              contract="ContractFactory"  
              method="createAndCall" 
              factoryContract="MultiSigWallet" 
              method2="initialize" 
              accountIndex="0"
            />
            <br/>
            <h2>QR Code</h2>
            <QRCode
              value={QrString}
              size={200}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"L"}
            />
            <br/>
          </div>
          </div>
        </div>
      </main>
    )
  }
}

Home.contextTypes = {
  drizzle: PropTypes.object
}
/*
 * Export connected component.
 */
const mapStateToProps = (state) => {
  return {
    drizzleStatus: state.drizzleStatus,
    contracts: state.contracts,
    accounts: state.accounts,
    owner: state.owner,
    walletAddress: state.walletAddress
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    createId: () => {dispatch(idCreating())}
  }
}

export default drizzleConnect(Home, mapStateToProps, mapDispatchToProps);
