import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button';
import SendIcon from "@material-ui/icons/Send";
import ethjsABI from 'ethjs-abi'
import {walletAddressUpdating,walletContractUpdating} from '../../actions/create/updateWallet';

/*
 * Create component.
 */

class ContractFormCreate extends Component {
  constructor(props, context) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.contracts = context.drizzle.contracts;
    this.web3 = context.drizzle.web3;

    // Get the contract ABI for Battleship
    this.MultiSigWalletABI = this.contracts[this.props.factoryContract].abi;
    this.MultiSigWalletContract =  new this.web3.eth.Contract(this.MultiSigWalletABI);

    // Get the proxy address as factory contract
    //this.address = this.contracts[this.props.contract].address;
    this.address = this.contracts["AdminUpgradeabilityProxy"].address;
    
    let i
    for (i = 0; i < this.MultiSigWalletABI.length; i++) {
      if (this.MultiSigWalletABI[i].name === "initialize") {
          this.initPos = i;
          break;
      }
    }

    for (i = 0; i < this.MultiSigWalletABI.length; i++) {
      if (this.MultiSigWalletABI[i].name === "submitTransaction") {
          this.submitPos = i;
          break;
      }
    }

    let initialState = {};
    this.state = initialState;
  }

  handleSubmit() {
    const self = this;
    const initWallet = ethjsABI.encodeMethod(self.MultiSigWalletABI[self.initPos], [[this.props.owner], 1, 500]);

    self.contracts[self.props.contract].methods[self.props.method](initWallet).estimateGas({from: self.props.accounts[self.props.accountIndex]})
    .then(function(gasAmount){
      self.contracts[self.props.contract].methods[self.props.method](initWallet).send({from: self.props.accounts[self.props.accountIndex], value:self.web3.utils.toWei("0", "ether") ,gas:(gasAmount + 100000)})
      .on('receipt', function(receipt){
        self.MultiSigWalletContract.options.address = receipt.events.ContractDeployed.returnValues.deployedAddress;
        self.props.updateWalletAddress(receipt.events.ContractDeployed.returnValues.deployedAddress);
        self.props.addWalletContract(self.MultiSigWalletContract);
      })
    })
    .catch(function(error){
        console.log(error);
    });
    //browserHistory.push('/dashboard')
  }

  render() {
    let status = this.props.owner === '' ? true : false
    return (
      <div>
      <p><Button variant="contained" color="primary" onClick={this.handleSubmit} disabled={status}>
        Create Wallet -<SendIcon />
      </Button></p>
      </div>
    )
  }
}

ContractFormCreate.contextTypes = {
  drizzle: PropTypes.object
}

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    contracts: state.contracts,
    accounts: state.accounts,
    owner: state.owner
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateWalletAddress: (walletAddress) => {dispatch(walletAddressUpdating(walletAddress))},
    addWalletContract: (walletContract) => {dispatch(walletContractUpdating(walletContract))}
  };
};

export default drizzleConnect(ContractFormCreate,mapStateToProps, mapDispatchToProps)
