import ethers from 'ethers';

export class Id {
    constructor (conf = {}) {
            this.password = null;
            this.encryptedId = null;  
            this.decryptedId = ethers.Wallet.createRandom();

        }

    randomPass() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.!$%&/;(=?¡[:-)]";
        for (var i = 0; i < 16; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    async init(){
        const self = this;
        const pass = this.randomPass();
        self.encryptedId = await self.decryptedId.encrypt(pass);
        self.password = pass;
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

