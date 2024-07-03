import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { PublicKey, SendOptions } from '@solana/web3.js';

import { AbstractSolanaClient } from './AbstractSolanaClient';
import { Solidr } from './types/solidr';

export type Global = {
  sessionCount: BN;
};

export class SolidrClient extends AbstractSolanaClient<Solidr> {
  public readonly globalAccountPubkey: PublicKey;
  private readonly wrapFn: <T = void>(fn: () => Promise<T>) => Promise<T>;

  constructor(program: Program<Solidr>, options?: SendOptions, wrapFn?: (fn: () => Promise<Solidr>) => Promise<Solidr>) {
    super(program, options);
    this.globalAccountPubkey = PublicKey.findProgramAddressSync([Buffer.from('global')], program.programId)[0];
    this.wrapFn = wrapFn || this._wrapFn.bind(this);
  }

  public async initGlobal(payer: Wallet) {
    return this.wrapFn(async () => {
      const tx = await this.program.methods
        .initGlobal()
        .accountsPartial({
          owner: payer.publicKey,
          globalAccount: this.globalAccountPubkey,
        })
        .transaction();

      return this.signAndSendTransaction(payer, tx);
    });
  }

  public async getGlobalAccount(globalAccountPubkey: PublicKey): Promise<Global> {
    return this.wrapFn(async () => {
      return this.program.account.globalAccount.fetch(globalAccountPubkey);
    });
  }

  public findGlobalAccountAddress(): PublicKey {
    const [globalAccountPubkey] = PublicKey.findProgramAddressSync([Buffer.from('global')], this.program.programId);
    return globalAccountPubkey;
  }
}
