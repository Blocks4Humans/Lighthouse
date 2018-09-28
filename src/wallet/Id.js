import ethers from 'ethers';
import bcrypt from 'bcryptjs';

export class Id {
    constructor(props, context) {
        this.password = null;
        this.privKey = null;
        this.address = null;
        this.encryptedId = null;
    }

    randomString() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ[/^!@#$%^&*()+$]0123456789abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < 20; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }

    async init(){
        const self = this;
        const randStr = this.randomString();
        const decryptedId = ethers.Wallet.createRandom();
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(randStr, salt);
        const pass = hash.substring(salt.length, hash.length );
        self.encryptedId = await decryptedId.encrypt(hash);
        self.password = pass;
        self.privKey = decryptedId.privKey;
        self.address = decryptedId.address;
    }
}
export default Id;


/*
    var wallet = Wallet.createRandom();
    wallet.encrypt(password)
    .then(function(json) {
        Wallet.fromEncryptedWallet(json, password).then(function(wallet) {
            console.log("wallet: " + util.inspect( wallet, {showHidden: false, depth: null}));
    });
*/

