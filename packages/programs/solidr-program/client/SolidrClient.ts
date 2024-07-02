import { Program } from '@coral-xyz/anchor';
import { PublicKey, SendOptions } from '@solana/web3.js';

import { AbstractSolanaClient } from './AbstractSolanaClient';
import { Solidr } from './types/solidr';

export class SolidrClient extends AbstractSolanaClient<Solidr> {
	public readonly globalAccountPubkey: PublicKey;
	private readonly wrapFn: <T = void>(fn: () => Promise<T>) => Promise<T>;

	constructor(program: Program<Solidr>, options?: SendOptions, wrapFn?: (fn: () => Promise<Solidr>) => Promise<Solidr>) {
		super(program, options);
		this.globalAccountPubkey = PublicKey.findProgramAddressSync([Buffer.from('global')], program.programId)[0];
		this.wrapFn = wrapFn || this._wrapFn.bind(this);
	}
}
