var MultiSigWalletWithDailyLimit = artifacts.require("MultiSigWalletWithDailyLimit");
var EthereumDIDRegistry = artifacts.require("EthereumDIDRegistry");

module.exports = function(deployer) {
	let dummyAccounts = []
	dummyAccounts[0] = "0xb8CE9ab6943e0eCED004cDe8e3bBed6568B2Fa01"
	dummyAccounts[1] = "0xe78150FaCD36E8EB00291e251424a0515AA1FF05"
	let requiredConfirmations = 1
	let dailyLimit = 1
	deployer.deploy(MultiSigWalletWithDailyLimit,[dummyAccounts[0], dummyAccounts[1]], requiredConfirmations, dailyLimit);

	deployer.deploy(EthereumDIDRegistry);
};