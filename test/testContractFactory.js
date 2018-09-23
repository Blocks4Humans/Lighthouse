var ethjsABI = require('ethjs-abi')
var ContractFactory = artifacts.require("ContractFactory");
var MultiSigWalletWithDailyLimit = artifacts.require("MultiSigWalletWithDailyLimit");


contract('ContractFactory', function(accounts) {
    let instance, bytecode, notFactoryWallet
    let newWalletPos, initWallet
    let requiredConfirmations = 1
    let dailyLimit = 1
    const owner = accounts[0]
    const person1 = accounts[1]
    const person2 = accounts[2]
    const code = accounts[5]

    before(async () => {
      instance = await ContractFactory.deployed()
	    notFactoryWallet = await MultiSigWalletWithDailyLimit.deployed()

		for (let i = 0; i < notFactoryWallet.contract.abi.length; i++) {
		  if (notFactoryWallet.contract.abi[i].name === "initialize") {
			  newWalletPos = i;
			  initWallet = ethjsABI.encodeMethod(notFactoryWallet.contract.abi[newWalletPos], [[person1, person2], requiredConfirmations, dailyLimit]);
			  break;
		  }
		}
      bytecode = await MultiSigWalletWithDailyLimit.bytecode
    })

    describe('Create a new game contract from factory and send initial data', () => {
      it('should pass players and data to game contract', async () => {
        try {
          await instance.createAndCall(initWallet)
        } catch (error) {
          assert.equal(error, 'undefined')
        }
      })
    })

    describe('Set bytecode into factory', () => {
      before(async () => {
        await instance.setBytecode(bytecode, {from: owner})
      })
      it('should return the same bytecode', async () => {
        const _bytecode = await instance.getBytecode({from: owner})
        assert.equal(bytecode, _bytecode)
      })
    })

    describe('Set bytecode into factory after locking', () => {
      let tx
      before(async () => {
        tx = await instance.lockFabric({from: owner})
      })
      it('should create FabricLocked event', () => {
        const event = tx.logs[0]
        assert.equal(event.event, 'FabricLocked')
        assert.equal(event.args.owner, owner)
      })
      it('should fail', async () => {
      try {
          await instance.setBytecode(code, {from: owner})
        } catch (error) {
          assert.equal(error.message, 'VM Exception while processing transaction: revert , contract locked.')

        }
      })
    })
})

