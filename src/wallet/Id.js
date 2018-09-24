import ethers from 'ethers';

export class Id {
    constructor (conf = {}) {
            this.password = null;  
            this.decryptedId = ethers.Wallet.createRandom();
        }

    randomPass() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.!$%&/;(=?¡[:-)]";
        for (var i = 0; i < 16; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    init(){
        this.password = this.randomPass();
        this.decryptedId.encrypt(this.password)
        .then(function(json) {
            this.encryptedId = json;
        })

    }
}


/*
    var wallet = Wallet.createRandom();
    wallet.encrypt(password)
    .then(function(json) {
        Wallet.fromEncryptedWallet(json, password).then(function(wallet) {
            console.log("wallet: " + util.inspect( wallet, {showHidden: false, depth: null}));
    });
*/

