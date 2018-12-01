<p align="center">
  <img src="./doc/images/LIGHTHOUSE.png"  width="200px"/>
</p>

# LIGHTHOUSE
![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)

The Lighthouse dApp is a decentralized platform that enables access to a new generation of Identity. The application uses Ethereum Whisper as its principal communication layer. The identities and signers are managed on the EthrDID Registry.

* [Specifications](./doc/Specifications.pdf)

![](./doc/images/Arch.png "Wallet generation")

### QR Code Arch

![](./doc/images/QR.png "Printed QR Code")

### Server

![](./doc/images/Server.png "Central point in design")

## Installation

### Requirements
* Unix system
* [Geth 1.8+](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)
* [NodeJS/LTS](https://nodejs.org/en/download/package-manager/)
* [Truffle Framework 4.1.14+](https://truffleframework.com/truffle)
* [Ganache-cli](https://github.com/trufflesuite/ganache-cli)

```sh
(Terminal 1)$ npm install
(Terminal 1)$ truffle compile
```

## Usage

```sh
(Terminal 3)$ npm run geth_dev:whisper
(Terminal 2)$ npm run ganache_dev
(Terminal 1)$ truffle migrate --network ganache_dev
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
[GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/)
