# Lighthouse

The Lighthouse dApp is a decentralized platform that enables access to a new generation of Identity. The application uses Ethereum Whisper as its principal communication layer. The identities and signers are managed on the EthrDID Registry.

The Id system uses a Proxy to redirect calls to the finall wallet factory.
![alt text](https://i2.wp.com/blog.zeppelinos.org/wp-content/uploads/2018/04/5Fixed.png)

## Installation

### Requirements
* Unix system
* [Geth 1.8+](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)
* [NodeJS/LTS](https://nodejs.org/en/download/package-manager/)

```sh
(Terminal 1)$ npm install
```

## Usage

```sh
(Terminal 2)$ npm run ganache-dev
(Terminal 3)$ npm run geth-dev:whisper
(Terminal 1)$ npm start
```

### Ports
```
Ganache - rpc:8545, ws:8545
Geth - rpc:8545, ws:8546
```
```
App runs on http://localhost:3000
```


## Tests

```
$ truffle test --network ganache
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[Apache-2.0](https://choosealicense.com/licenses/apache-2.0/)