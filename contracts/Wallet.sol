pragma solidity ^0.4.15;

import "./openzeppelin/migrations/Initializable.sol";
import "./gnosis-wallet/MultiSigWalletWithDailyLimit.sol";

/// @title Multisignature wallet with daily limit - Allows an owner to withdraw a daily limit without multisig.
/// @author Stefan George - <stefan.george@consensys.net>
contract Wallet is MultiSigWalletWithDailyLimit,Initializable {

    /// @dev Contract initializer sets initial owners, required number of confirmations and daily limit.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    /// @param _dailyLimit Amount in wei, which can be withdrawn without confirmations on a daily basis.
    function initialize(address[] _owners, uint _required, uint _dailyLimit)
        external 
        isInitializer
        validRequirement(_owners.length, _required)
    {
        for (uint i=0; i<_owners.length; i++) {
            require(!isOwner[_owners[i]] && _owners[i] != 0);
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        required = _required;
        dailyLimit = _dailyLimit;
    }
    
}