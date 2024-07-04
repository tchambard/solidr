import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { PublicKey, SendOptions } from '@solana/web3.js';

import { AbstractSolanaClient, ITransactionResult, ProgramInstructionWrapper } from './AbstractSolanaClient';
import { Solidr } from './types/solidr';

export type Global = {
    sessionCount: BN;
};

type InternalSessionStatus = ({ closed?: never } & { opened: Record<string, never> }) | ({ opened?: never } & { closed: Record<string, never> });

type InternalSession = {
    sessionId: BN;
    name: string;
    description: string;
    status: InternalSessionStatus;
    admin: PublicKey;
    membersCount: number;
    expensesCount: number;
};

export enum SessionStatus {
    Opened,
    Closed,
}

export type Session = {
    sessionId: BN;
    name: string;
    description: string;
    status: SessionStatus;
    admin: PublicKey;
    membersCount: number;
    expensesCount: number;
};

export class SolidrClient extends AbstractSolanaClient<Solidr> {
    public readonly globalAccountPubkey: PublicKey;

    constructor(program: Program<Solidr>, options?: SendOptions, wrapFn?: ProgramInstructionWrapper<Solidr>) {
        super(program, options);
        this.globalAccountPubkey = PublicKey.findProgramAddressSync([Buffer.from('global')], program.programId)[0];
    }

    public async initGlobal(payer: Wallet) {
        return this.wrapFn(async () => {
            const tx = await this.program.methods
                .initGlobal()
                .accountsPartial({
                    owner: payer.publicKey,
                    global: this.globalAccountPubkey,
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

    public async openSession(payer: Wallet, name: string, description: string): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionId = (await this.getNextSessionId()) || new BN(0);
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);

            const tx = await this.program.methods
                .openSession(name, description)
                .accountsPartial({
                    admin: payer.publicKey,
                    session: sessionAccountPubkey,
                    global: this.globalAccountPubkey,
                })
                .transaction();

            return this.signAndSendTransaction(payer, tx, {
                sessionAccountPubkey,
            });
        });
    }

    public async getNextSessionId(): Promise<BN> {
        return this.wrapFn(async () => {
            return (await this.program.account.globalAccount.fetch(this.globalAccountPubkey)).sessionCount;
        });
    }

    public async getSession(sessionAccountPubkey: PublicKey): Promise<Session> {
        return this.wrapFn(async () => {
            const internal = await this.program.account.sessionAccount.fetch(sessionAccountPubkey);
            return this.mapSession(internal);
        });
    }

    public findSessionAccountAddress(sessionId: BN): PublicKey {
        const [sessionAccountPubkey] = PublicKey.findProgramAddressSync([Buffer.from('session'), sessionId.toBuffer('le', 8)], this.program.programId);
        return sessionAccountPubkey;
    }

    public mapSessionStatus(internalStatus: InternalSessionStatus): SessionStatus {
        if (internalStatus.opened) return SessionStatus.Opened;
        if (internalStatus.closed) return SessionStatus.Closed;
        throw new Error('Bad session status');
    }

    private mapSession = (internalSession: InternalSession): Session => {
        return {
            ...internalSession,
            status: this.mapSessionStatus(internalSession.status),
        };
    };
}
