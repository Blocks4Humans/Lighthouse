import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { drizzleReducers } from 'drizzle'
import {ownerUpdate,walletAddressUpdate,walletContractUpdate} from './reducers/create/updateWallet'
import {errorPeer2,waitPeer2,existsPeer2} from './reducers/whisper/joinChannel'

const reducer = combineReducers({
  routing: routerReducer,
  owner: ownerUpdate,
  walletAddress: walletAddressUpdate,
  walletContract: walletContractUpdate,
  whisperError: errorPeer2,
  whisperWait: waitPeer2,
  whisperSuccess: existsPeer2,
  ...drizzleReducers
})

export default reducer
