import { atom } from 'recoil';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
	Connection,
	LAMPORTS_PER_SOL,
	PublicKey,
	clusterApiUrl,
} from '@solana/web3.js';
import { SolidrClient } from '@solidr';

type WalletState = {
	network: WalletAdapterNetwork;
	endpoint: string;
	connection: Connection;
};

type TxState = {
	pending: boolean;
	error?: string;
};

export const network = WalletAdapterNetwork.Devnet;
export const endpoint = clusterApiUrl(network);
// export const endpoint = 'http://localhost:8899/';
export const connection = new Connection(endpoint, 'confirmed');

export const walletState = atom<WalletState>({
	key: 'walletState',
	default: {
		network,
		endpoint,
		connection,
	},
});

export const txState = atom<TxState>({
	key: 'txState',
	default: {
		pending: false,
	},
});

export const solidrClientState = atom<SolidrClient | undefined>({
	key: 'solidrClientState',
	default: undefined,
});

export async function getSolanaBalance(publicKey: string): Promise<number> {
	const balanceInLamports = await connection.getBalance(
		new PublicKey(publicKey),
	);
	const balanceInSol = balanceInLamports / LAMPORTS_PER_SOL;

	return balanceInSol;
}
