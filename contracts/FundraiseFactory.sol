pragma solidity 0.4.24;

import "./libraries/openzeppelin/lifecycle/Destructible.sol";

/// @title Factory that generates new contracts from loaded bytecode.
/// @author Ricardo Rius - <ricardo@rius.info>
//  LICENSE: GNU AGPLv3
contract FundraiseFactory is Destructible {

    uint public creationTime;
    bool internal locked;
    bytes internal bytecode;
    
    constructor() public {
        bytecode = hex"0000000000000000000000000000000000000000";
        locked = false;
        creationTime = block.timestamp;
    }

    event ContractDeployed(address emiter, address deployedAddress);
    event BytecodeChanged(address owner, string message);
    event FabricLocked(address owner, string message);

    /// @dev Verifies if caller is owner. Owner is inherited from Ownable <- Destructible
    modifier ifOwner() {
        if(msg.sender == owner) {
            _;
        } else {
            revert(", not owner.");
        }
    }

    /// @dev Verifies if the contract has not been manually locked.
    modifier ifNotLocked(){
        if(!locked){
            _;
        } else{
            revert(", contract locked.");
        }
    }

    /// @dev Verifies the required time to automatically lock the contract.
    modifier lockAfter(uint _time) {
        require(block.timestamp < (creationTime + _time),", the function is locked by time.");
        _;
    }
    
    /// @dev It enables a way to update the bytecode by replacing it.
    /// @param _data The new bytecode data.
    function setBytecode(bytes _data) external ifOwner lockAfter(2 weeks) ifNotLocked{
        uint len = _data.length;
        require(len >= 20, "incorrect bytecode size.");
        bytecode = _data;
        emit BytecodeChanged(owner, ", the owner updated the code.");
    }
    
    /// @dev Only owner can retrieve the loaded bytecode.
    function getBytecode() external view ifOwner returns(bytes){
        return bytecode;
    }

    /// @dev Manually lock the contract by not letting it change the bytecode.
    function lockFabric() external ifOwner ifNotLocked{
        locked = true;
        emit FabricLocked(owner, ", the fabric bytecode became not upgradable.");
    }

    /// @dev Creates a new contract instance and calls the encoded data after creation.
    /// @param _data encoded data to call a specific function in the new instance.
    function createAndCall(bytes _data) external payable {
        address deployed = _deployCode(bytecode);
        require(deployed.call.value(msg.value)(_data),", failed to send _data.");
        emit ContractDeployed(msg.sender, deployed);
    }

    /// @dev Function that deploys a new contract/instance.
    /// @param _data bytecode that will be deployed.
    function _deployCode(bytes memory _data) internal returns (address deployedAddress) {
        assembly {
            deployedAddress := create(0, add(_data, 0x20), mload(_data))
            if eq(deployedAddress, 0x0) {
                revert(0, 0)
            }
        }
    }
    
    /* fallback */
    function () public {
        revert();
    }
}
