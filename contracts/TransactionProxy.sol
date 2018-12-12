pragma solidity 0.4.24;

import "./libraries/openzeppelin/migrations/Initializable.sol";
import "./libraries/openzeppelin/lifecycle/Pausable.sol";
import "./libraries/openzeppelin/cryptography/ECDSA.sol";
import "./libraries/openzeppelin/utils/Address.sol";


contract TransactionProxy is Pausable,Initializable{

    using ECDSA for bytes32;

    /*
     POINTERS SIGNATURES
    */
    bytes4 private constant TOKEN_ROUTE = bytes4(keccak256("Token.Transfer"));
    bytes4 private constant DATA_ROUTE = bytes4(keccak256("Data.Send"));

    /*
     STATE VARIABLES
    */
    address public ethrReg;
    address public proxyRouter;
    mapping(address => uint) public nonce;
    
    /*
    EXTERNAL FUNCTIONS
    */
    function initialize(
        address _registry,
        address _proxyRouter
    ) 
        external 
        isInitializer 
    {
        require(Address.isContract(_registry), ", cannot set a proxy implementation to a non-contract address");
        ethrReg = _registry;
        proxyRouter = _proxyRouter;
    }

    /*
     EVENTS
    */
    event Forwarded (
        bytes sig, 
        address identity, 
        address destination, 
        uint value, 
        bytes data,
        address rewardToken, 
        uint rewardAmount,
        bytes32 hash
    );

    /*
     PUBLIC FUNCTIONS
    */
    /// @dev Fallback function
    function () external payable{
    }

    function forward(
        bytes _sig, 
        address _identity, 
        address _destination, 
        uint _value, 
        bytes _data, 
        address _rewardToken, 
        uint _rewardAmount
    ) 
        public 
        whenNotPaused
    {
        
        uint seq = nonce[_identity];
        bytes32 hash = keccak256(abi.encodePacked(address(this), _identity, _destination, _value, _data, _rewardToken, _rewardAmount, seq));
        nonce[_identity]++;

        address sigAddr = ECDSA.recover(hash.toEthSignedMessageHash(),_sig);
        require(_isValidDelegate(_identity, "txRelay", msg.sender, ethrReg),", invalid signer.");

        bool signerStatus = false;
        bool status = false;
        address identityOwner = _getIdOwner(_identity, ethrReg);
        signerStatus = _isValidDelegate(_identity, "veriKey", sigAddr, ethrReg);
        if(identityOwner == sigAddr){
            status = true;
        }else if(signerStatus){
            status = true;
        }else{
            status = false;
        }
        
        require(status,", invalid status.");
        if(_rewardAmount > 0){
            if(_rewardToken == address(0)){
                msg.sender.transfer(_rewardAmount);
            }else {
                require(_transferToken(_rewardToken,msg.sender,_rewardAmount),", could not pay with token");
            }
        }
        (bytes memory txData,) = _encodeData(DATA_ROUTE, _destination, _data);
        /* solium-disable-next-line security/no-call-value */
        require(proxyRouter.call.value(_value)(txData),", failed to send data."); // Cannot receive data.
        emit Forwarded(_sig, _identity, _destination, _value, _data, _rewardToken, _rewardAmount, hash);
    }

    /*
     INTERNAL FUNCTIONS
    */
    /// @dev Gets Id Owner from the Ethr DID registry.
    /// @param _identity The address owner.
    /// @param _registry The address of the Ethr DID registry.
    function _getIdOwner(
        address _identity, 
        address _registry
    ) internal view returns(address result)
    {
        require(_registry != address(0), ", invalid registry.");
        require(_identity != address(0), ", invalid identity.");
        bytes memory data = abi.encodeWithSignature("identityOwner(address)", _identity);
        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            let ptr := mload(0x40)
            let success := staticcall(sub(gas, 1500), _registry, add(data, 0x20), mload(data), ptr, 0x20)
            if eq(success, 0) {
                revert(0, 0)
            }
            result := mload(ptr)
        } 
    }

    /// @dev Verifies if the signer delegate is valid in the Ethr DID registry.
    /// @param _identity The address owner.
    /// @param _delegateType Type of delegate. Signer -> Secp256k1VerificationKey2018 -> bytes32("veriKey").
    /// @param _delegate The address of the signer delegate.
    /// @param _registry The address of the Ethr DID registry.
    function _isValidDelegate(
        address _identity, 
        string _delegateType, 
        address _delegate, 
        address _registry
    ) internal view returns(bool result)
    {
        require(_registry != address(0), ", invalid registry.");
        require(_identity != address(0) && bytes(_delegateType).length > 0 && _delegate != address(0),", invalid delegate input.");
        bytes memory data = abi.encodeWithSignature("validDelegate(address,bytes32,address)", _identity, _stringToBytes32(_delegateType), _delegate);
        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            let ptr := mload(0x40)
            let success := staticcall(sub(gas, 3800), _registry, add(data, 0x20), mload(data), ptr, 0x20)
            if eq(success, 0) {
                revert(0, 0)
            }
            result := mload(ptr)
        } 
    } 

    // @title SecuredTokenTransfer - Secure token transfer
    // @author Richard Meissner - <richard@gnosis.pm>
    /// @dev Transfers a token and returns if it was a success
    /// @param _tokenAddr Token that should be transferred
    /// @param _receiver Receiver to whom the token should be transferred
    /// @param _amount The amount of tokens that should be transferred
    function _transferToken (
        address _tokenAddr, 
        address _receiver,
        uint256 _amount
    ) internal returns (bool transferred)
    {
        bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", _receiver, _amount);
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            let success := call(sub(gas, 10000), _tokenAddr, 0, add(data, 0x20), mload(data), 0, 0)
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, returndatasize)
            switch returndatasize 
            case 0 { transferred := success }
            case 0x20 { transferred := iszero(or(iszero(success), iszero(mload(ptr)))) }
            default { transferred := 0 }
        }
    }


    function _encodeData(bytes4 _route, address _destination, bytes _data) 
        internal 
        pure 
        returns (
            bytes memory result, 
            uint size
        ) 
    {
        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            let ptr := mload(0x40)
            mstore(ptr,_route)
            mstore(add(ptr,0x04), _destination)
            mstore(add(ptr,0x24), _data)
            result := mload(ptr)
            size:= add(calldatasize,0x24)
        }
    } 

    /// @dev Converts string to bytes32 type.
    /// @param _string string data.
    /// @return string converted to bytes32.
    function _stringToBytes32(string memory _string) 
        internal 
        pure 
        returns (bytes32 result) 
    {
        require(bytes(_string).length > 0, ", incorrect string lenght.");
        /* solium-disable-next-line security/no-inline-assembly */
        assembly {
            result := mload(add(_string, 32))
        }
        return result;
    }
}
