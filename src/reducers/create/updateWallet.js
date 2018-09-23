

export function updateOwner(state = '', action) {
    switch (action.type) {
        case 'UPDATE_OWNER':
            return action.owner;

        default:
            return state;
    }
}

export function updateWalletAddress(state = '', action) {
    switch (action.type) {
        case 'UPDATE_WALLET_ADDRESS':
            return action.walletAddress;

        default:
            return state;
    }
}

export function updateWalletContract(state = {}, action) {
    switch (action.type) {
        case 'UPDATE_WALLET_CONTRACT':
            return action.walletContract;

        default:
            return state;
    }
}
