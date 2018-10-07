var AdminUpgradeabilityProxy = artifacts.require("AdminUpgradeabilityProxy");
var WalletFactory = artifacts.require("WalletFactory");

module.exports = function(deployer) {

	deployer.deploy(AdminUpgradeabilityProxy, WalletFactory.address);

};


