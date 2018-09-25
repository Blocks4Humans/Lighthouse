import ethers from 'ethers';

export class Id {
    constructor (conf = {}) {
            this.password = null;  
            this.decryptedId = ethers.Wallet.createRandom();
            this.encryptedId = null;
        }

    randomPass() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.!$%&/;(=?¡[:-)]";
        for (var i = 0; i < 16; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    init(){
        const self = this;
        self.password = this.randomPass();
        self.decryptedId.encrypt(this.password)
        .then(function(json) {
            self.encryptedId = json;
            return json;
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

