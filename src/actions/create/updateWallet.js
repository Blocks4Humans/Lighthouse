import {Id} from '../../wallet/Id'

export function ownerUpdating(owner) {
    return {
        type: 'UPDATE_OWNER',
        owner
    };
}

export function idCreating() {
    return async (dispatch) => {
    try {
        const identity = new Id();
        await identity.init();
        const ID = JSON.parse(identity.encryptedId);
        const owner = "0x" + ID.address;
        dispatch(ownerUpdating(owner));
      } catch (error) {
        console.log(error)
      }
    }
}

export function walletAddressUpdating(walletAddress) {
    return {
        type: 'UPDATE_WALLET_ADDRESS',
        walletAddress
    };
}

export function walletContractUpdating(walletContract) {
    return {
        type: 'ADD_WALLET_CONTRACT',
        walletContract
    };
}