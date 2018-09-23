
export function updatingOwner(owner) {
    return {
        type: 'UPDATE_OWNER',
        owner
    };
}

export function updatingWalletAddress(walletAddress) {
    return {
        type: 'UPDATE_WALLET_ADDRESS',
        walletAddress
    };
}

export function updatingWalletContract(walletContract) {
    return {
        type: 'ADD_WALLET_CONTRACT',
        walletContract
    };
}