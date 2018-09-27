import { drizzleConnect } from 'drizzle-react'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button';
import SendIcon from "@material-ui/icons/Send";
import ethjsABI from 'ethjs-abi'
import {Id} from '../../wallet/Id'
import {updatingOwner,updatingWalletAddress,updatingWalletContract,} from '../../actions/create/updateWallet';

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

    this.identity = new Id();

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

  async componentDidMount() {
    try {
      await this.identity.init();
    } catch (error) {
      console.log(error);
    }
  }

  handleSubmit() {
    const self = this;

    let ID = JSON.parse(this.identity.encryptedId);
    let owner = "0x" + ID.address;
    self.props.updateOwner(owner);

    const initWallet = ethjsABI.encodeMethod(self.MultiSigWalletABI[self.initPos], [[owner], 1, 500]);

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
    return (
      <div>
      <p><Button variant="contained" color="primary" onClick={this.handleSubmit}>
        Create  <SendIcon />
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
    owner: state.owner,
    walletAddress: state.walletAddress
  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    updateOwner: (owner) => {dispatch(updatingOwner(owner))},
    updateWalletAddress: (walletAddress) => {dispatch(updatingWalletAddress(walletAddress))},
    addWalletContract: (walletContract) => {dispatch(updatingWalletContract(walletContract))}
  };
};

export default drizzleConnect(ContractFormCreate,mapStateToProps, mapDispatchToProps)
