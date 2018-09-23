
var ethers = require('ethers');
var Wallet = ethers.Wallet;
const util = require('util')

var password = "password123";

var wallet = Wallet.createRandom();
wallet.encrypt(password)
.then(function(json) {
    Wallet.fromEncryptedWallet(json, password).then(function(wallet) {
        console.log("wallet: " + util.inspect( wallet, {showHidden: false, depth: null}));
    });
});

