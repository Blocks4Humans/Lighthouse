import getWeb3 from '../util/web3/getWeb3'
import MultiSigWalletWithDailyLimit from './contracts/MultiSigWalletWithDailyLimit.json';
import ContractFactory from './contracts/ContractFactory.json';
import contract from 'truffle/packages/truffle-contract/';
import ethers from 'ethers';
import util from 'util';

class Wallet {
    constructor (conf = {}) {
        getWeb3.then(results => {
                this.web3 = results.web3Instance;
                this.provider = results.web3Provider;
            }).catch(console.log);
            this.password = null;  
            this.multiSigWallet = contract(MultiSigWalletWithDailyLimit);
            this.id = ethers.Wallet.createRandom();
        }

    randomPass() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 16; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    init(){
        this.password = this.randomPass();
        this.id.encrypt(this.password);
        const factory = contract(ContractFactory);

        factory.deployed().then(function(instance) {
            return instance.createAndCall(5);
          }).then(function(result) {
              
          });

    }
};

export default Wallet;

/*
    var wallet = Wallet.createRandom();
    wallet.encrypt(password)
    .then(function(json) {
        Wallet.fromEncryptedWallet(json, password).then(function(wallet) {
            console.log("wallet: " + util.inspect( wallet, {showHidden: false, depth: null}));
    });
*/

