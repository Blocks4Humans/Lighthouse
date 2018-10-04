var ContractFactory = artifacts.require("ContractFactory");
var Wallet = artifacts.require("Wallet");

module.exports = function(deployer) {
	
	var bytecode = '0x0';
	var tx;

	const code = MultiSigWallet.bytecode;
	bytecode = code.toString()
	const size = bytecode.length -1

	deployer.deploy(ContractFactory)
	.then(function(instance) {
		var pos=8001;
		var i=0, j = 0;
		while(i <= size){
            i = pos === size ? size + 1 : pos;
            tx = instance.setBytecode(bytecode.slice(0, i),{gas:0x7A1200})
			pos = pos > size ? size : (pos + (4000 + (j * 400)));
			pos = pos > size ? size : pos;
			j++;
		}
		return tx;
	})
};