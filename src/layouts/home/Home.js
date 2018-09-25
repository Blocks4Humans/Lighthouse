import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import ContractFormCreate from '../../components/ContractFactory/ContractFormCreate'
//import { channelCreating } from '../../actions/whisper/channelCreate';
//import SuccessSnackbar from '../../components/SuccessSnackbar';
//import WarningSnackbar from '../../components/WarningSnackbar';

class Home extends Component {
  render() {
    return (
      <main className="container">
        <div className="pure-g">
          <div className="pure-u-1-1 header">
            <h1>LIGHTHOUSE</h1>
            <br/><br/>
          </div>
          <div className="pure-u-1-1">
            <div className="pure-u-1-1">
            <h2>Wallet Factory</h2>
            <p>Create the a new wallet and Id.</p>
            <p>Owner:  {this.props.owner}</p>
            <p>Wallet Address: {this.props.walletAddress}</p>
            <p><strong>Emmitter Account: </strong></p>{this.props.accounts[this.props.accountIndex]}
            <ContractFormCreate 
            contract="ContractFactory"  
            method="createAndCall" 
            factoryContract="MultiSigWalletWithDailyLimit" 
            method2="initialize" 
            accountIndex="0"
            />
            <br/><br/>
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

  }
}

export default drizzleConnect(Home, mapStateToProps, mapDispatchToProps);
