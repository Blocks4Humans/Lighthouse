import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'
import ContractFormCreate from '../../components/ContractFactory/ContractFormCreate'
import { channelCreating } from '../../actions/whisper/channelCreate';
import SuccessSnackbar from '../../components/SuccessSnackbar';
import WarningSnackbar from '../../components/WarningSnackbar';

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
            <h2>ContractFactory</h2>
            <p>This shows a simple ContractData component with no arguments, along with a form to set its value.</p>
            <ContractFormCreate 
            contract="ContractFactory"  
            method="createAndCall" 
            factoryContract="MultiSigWalletWithDailyLimit" 
            method2="initialize" 
            accountIndex="0"
            labels={['Owners', 'Required','$ Daily Limit']}
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
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus
  }
}
const mapDispatchToProps = (dispatch) => {
  return {

  }
}

export default drizzleConnect(Home, mapStateToProps, mapDispatchToProps);
