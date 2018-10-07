pragma solidity 0.4.24;

import "./libraries/openzeppelin/token/ERC20/ERC20Basic.sol";
import "./libraries/openzeppelin/ECRecovery.sol";
import "./libraries/uport/Proxy.sol";
import "./libraries/Bytes.sol";

// Based on https://github.com/austintgriffith/bouncer-proxy
contract TransactionProxy is Proxy {

    using ECRecovery for bytes32;

    address ethrReg;
    mapping(address => uint) public nonce;
    mapping(address => bool) public whitelist;
    
    constructor(address registry) public {
        whitelist[msg.sender] = true;
        ethrReg = registry;
    }

    event UpdateWhitelist(address _account, bool _value);
    event Forwarded (
        bytes sig, 
        address signer, 
        address destination, 
        uint value, 
        bytes data,
        address rewardToken, 
        uint rewardAmount,
        bytes32 _hash
    );

    /// @dev Verifies if caller is whitelisted.
    modifier ifWhitelisted() {
        if(whitelist[msg.sender] == true) {
            _;
        } else {
            revert(", not whitelisted.");
        }
    }

    function updateWhitelist(address _account) public ifWhitelisted returns(bool) {
        //Validate signer delegate from Ethr registry. Secp256k1VerificationKey2018 -> "veriKey"
        bool result = isValidDelegate(msg.sender, Bytes.stringToBytes32("veriKey"), _account); 
        require(result == true, ", not a valid ethr signer delegate.");
        whitelist[_account] = result;
        emit UpdateWhitelist(_account,result);
        return true;
    }

    function forward(
        bytes sig, 
        address signer, 
        address destination, 
        uint value, 
        bytes data, 
        address rewardToken, 
        uint rewardAmount
        ) public {

        uint seq = nonce[signer];
        bytes32 _hash = keccak256(abi.encodePacked(address(this), signer, destination, value, data, rewardToken, rewardAmount, seq));
        nonce[signer]++;
        address sigAddr = ECRecovery.recover(_hash.toEthSignedMessageHash(),sig);
        require(whitelist[sigAddr],", forward signer is not whitelisted.");
        //make sure the signer pays in whatever token (or ether) the sender and signer agreed to
        // or skip this if the sender is incentivized in other ways and there is no need for a token
        if(rewardAmount > 0){
            if(rewardToken == address(0)){
                //REWARD ETHER
                require(msg.sender.call.value(rewardAmount).gas(36000)());
            }else{
                //REWARD TOKEN
                require((ERC20Basic(rewardToken)).transfer(msg.sender,rewardAmount));
            }
        }
        require(executeCall(destination, value, data));
        emit Forwarded(sig, signer, destination, value, data, rewardToken, rewardAmount, _hash);
    }

    /// @dev Verifies if the signer delegate is valid in the Ethr DID registry.
    /// @dev Similar to registry.call(bytes4(keccak256("validDelegate(address,bytes32,address)")), abi.encode(_identity, _delegateType, _delegate))
    /// @param _identity The address owner.
    /// @param _delegateType Type of delegate. Signer -> Secp256k1VerificationKey2018 -> bytes32("veriKey").
    /// @param _delegate The address of the signer delegate.
    function isValidDelegate(address _identity, bytes32 _delegateType, address _delegate) internal ifWhitelisted returns(bool result){
        require(ethrReg != address(0), ", ethr registry not set.");
        require(_identity != address(0) && _delegateType != bytes32(0) && _delegate != address(0),", invalid delegate input.");
        bytes4 funcSig = bytes4(keccak256("validDelegate(address,bytes32,address)"));
        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            // Move pointer to free memory spot.
            let ptr := mload(0x40)
            // Put function signature at memory spot.
            mstore(ptr,funcSig)
            // Append arguments after function signature.
            mstore(add(ptr,0x04), _identity)
            mstore(add(ptr,0x24), _delegateType)
            mstore(add(ptr,0x44), _delegate)
            let success := call(
              4000, // Gas limit.
              sload(ethrReg_slot), // Append _slot to access Ethr DID registry storage.
              0, // No ether tansfer.
              ptr, // Inputs are stored at location ptr.
              0x64, // Sum of all inputs is 100 bytes long.
              ptr,  //Store output over input.
              0x20) //Outputs are 32 bytes long.
            if eq(success, 0) {
                revert(0, 0)
            }
            result := mload(ptr) // Assign output to result var
            mstore(0x40,add(ptr,0x64)) // Set storage pointer to new space
        }  
    }
}
