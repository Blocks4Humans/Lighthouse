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
    this.handleInputChange = this.handleInputChange.bind(this);

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
    let initialState = {};
    for (i = 0; i < this.MultiSigWalletABI.length; i++) {
      if (this.MultiSigWalletABI[i].name === "initialize") {
          this.initPos = i;
          this.inputs = this.MultiSigWalletABI[i].inputs;

          for (i = 0; i < this.inputs.length; i++) {
              initialState[this.inputs[i].name] = '';
          }
          break;
      }
    }

    for (i = 0; i < this.MultiSigWalletABI.length; i++) {
      if (this.MultiSigWalletABI[i].name === "submitTransaction") {
          this.submitPos = i;
          break;
      }
    }

    this.state = initialState;
  }

  handleSubmit() {
    const self = this;
 
    self.props.updateOwner(self.props.accounts[self.props.accountIndex]);
    const initWallet = ethjsABI.encodeMethod(self.MultiSigWalletABI[self.initPos], [[this.state["_owners"][0], this.state["_owners"][1]], this.state["_required"], this.state["_dailyLimit"]]);

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

  handleInputChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  translateType(type) {
    switch(true) {
        case /^uint/.test(type):
            return 'number'
        case /^string/.test(type) || /^bytes/.test(type):
            return 'text'
        case /^bool/.test(type):
            return 'checkbox'
        default:
            return 'text'
    }
  }

  render() {
    return (
      <div>
      <form className="pure-form pure-form-stacked">
        {this.inputs.map((input, index) => {            
            var inputType = this.translateType(input.type)
            var inputLabel = this.props.labels ? this.props.labels[index] : input.name
            // check if input type is struct and if so loop out struct fields as well
            return (<input key={input.name} type={inputType} name={input.name} value={this.state[input.name]} placeholder={inputLabel} onChange={this.handleInputChange} />)
        })}
      </form>
      <p><strong>Emmiter Account: </strong></p>{this.props.accounts[this.props.accountIndex]}
      <p><Button variant="contained" color="primary" onClick={this.handleSubmit}>
        Create ID  -<SendIcon />
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
    updateOwner : (owner) => {dispatch(updatingOwner(owner))},
    updateWalletAddress : (walletAddress) => {dispatch(updatingWalletAddress(walletAddress))},
    addWalletContract: (walletContract) => {dispatch(updatingWalletContract(walletContract))}
  };
};

export default drizzleConnect(ContractFormCreate,mapStateToProps, mapDispatchToProps)
