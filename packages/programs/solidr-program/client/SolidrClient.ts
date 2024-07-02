import { IdlEvents, Program } from '@coral-xyz/anchor';
import { PublicKey, SendOptions } from '@solana/web3.js';

import { AbstractSolanaClient } from './AbstractSolanaClient';

export class SolidrClient extends AbstractSolanaClient<any> {
	public readonly globalAccountPubkey: PublicKey;
	private readonly wrapFn: <T = void>(fn: () => Promise<T>) => Promise<T>;

	constructor(program: Program<any>, options?: SendOptions, wrapFn?: (fn: () => Promise<any>) => Promise<any>) {
		super(program, options);
		this.globalAccountPubkey = PublicKey.findProgramAddressSync([Buffer.from('global')], program.programId)[0];
		this.wrapFn = wrapFn || this._wrapFn.bind(this);
	}

	public addEventListener<E extends keyof IdlEvents<any>>(eventName: E & string, callback: (event: IdlEvents<any>[E], slot: number, signature: string) => void): number | undefined {
		try {
			return this.program.addEventListener(eventName, callback);
		} catch (e) {
			// silent error. problem encountered on vite dev server because of esm
			return;
		}
	}

	private async _wrapFn(fn: () => Promise<any>): Promise<any> {
		try {
			return await fn();
		} catch (e) {
			throw e;
		}
	}
}
