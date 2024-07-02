import { Connection, Keypair } from '@solana/web3.js';
import idl from '../target/idl/solidr.json';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import { Solidr, SolidrClient } from '../client';
import dotenv from 'dotenv';

dotenv.config();

const walletSecretKey = process.env.WALLET_SECRET_KEY;
if (!walletSecretKey) {
	throw new Error('Missing WALLET_SECRET_KEY in .env');
}
const anchorProviderUrl = process.env.ANCHOR_PROVIDER_URL;
if (!anchorProviderUrl) {
	throw new Error('Missing ANCHOR_PROVIDER_URL in .env');
}
const secretKey = Uint8Array.from(JSON.parse(walletSecretKey));
const walletKeypair = Keypair.fromSecretKey(secretKey);

const deploy = async () => {
	const connection = new Connection(anchorProviderUrl, 'confirmed');
	const wallet = new Wallet(walletKeypair);
	const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());

	const program = new Program<Solidr>(idl as Solidr, provider);
	const votingClient = new SolidrClient(program, { skipPreflight: false });

	// TODO: call init instruction
};

deploy().catch(console.error);
