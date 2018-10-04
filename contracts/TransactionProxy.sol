pragma solidity 0.4.24;

import "./openzeppelin/ECRecovery.sol";
import "./openzeppelin/token/ERC20/ERC20Basic.sol";
import "./uport/Proxy.sol";

contract TransactionProxy is Proxy {

    using ECRecovery for bytes32;

    mapping(address => uint) public nonce;
    mapping(address => bool) public whitelist;
    
    constructor() public {
        whitelist[msg.sender] = true;
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

    function updateWhitelist(address _account, bool _value) public returns(bool) {
        require(whitelist[msg.sender],", updateWhitelist account not whitelisted.");
        whitelist[_account] = _value;
        emit UpdateWhitelist(_account,_value);
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
}