[![Dev Continuous integration](https://github.com/tchambard/solidr/actions/workflows/ci.yml/badge.svg)](https://github.com/tchambard/solidr/actions/workflows/ci.yml)

# Solid-R

The decentralized application for simple sharing expenses.

Developped on Solana.

# How to contribute

## How to develop with docker

cf [solana-test-validator-docker](https://github.com/tchambard/solana-test-validator-docker)

## How to use this repository

See all scripts in main package.json file.

### Install dependencies

```sh
yarn install
```

### Compile all packages

```sh
yarn run compile:all
```

### Apply lint rules

```sh
yarn run lint:all
```

### Run unit tests

```sh
yarn run test:all
```

### Useful scripts

Inside `packages/programs/solidr-program`

```sh
yarn run use-local -> solana-docker config set --url localhost --keypair /opt/.config/solana/id.json
yarn run deploy-local -> anchor-docker deploy --provider.cluster localhost
yarn run init-local -> ANCHOR_PROVIDER_URL=http://localhost:8899 ts-node migrations/initGlobal.ts
yarn run use-devnet -> solana-docker config set --url devnet --keypair /opt/.config/solana/id.json
yarn run deploy-devnet -> anchor-docker deploy --provider.cluster devnet
yarn run init-devnet -> ANCHOR_PROVIDER_URL=https://api.devnet.solana.com ts-node migrations/initGlobal.ts
yarn run start-local-test-validator -> solana-docker-shell exec "solana-test-validator --ledger /opt/.config/solana/.ledger --bind-address 0.0.0.0 --rpc-port 8899"
```

## Deployments

### Devnet deployed program

-   program ID: 7kUL66rcAhxgisSeBtXoH7Pn9C5hWZa4m2Bp9mRcwtmv
-   init global tx: Cww3SNfRfJEAaKgBeRGp1Jy16m3LVe3djfJB9kzwQ2wAFHBHMQ5T8sqAh1p5a6ShHxrtbJt6VQb1w5dGFzcGrgZ

# Commands to launch the dApp

cd solidr
yarn install

cd packages/programs/solidr-program
anchor build
anchor deploy

cd packages/fronts/solidr-front-dapp
yarn compile && yarn preview