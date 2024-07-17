import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { AccountMeta, PublicKey, SendOptions, Transaction } from '@solana/web3.js';
import { sha256 } from 'js-sha256';
import { bs58 } from '@coral-xyz/anchor/dist/cjs/utils/bytes';
import * as _ from 'lodash';

import { AbstractSolanaClient, ITransactionResult, ProgramInstructionWrapper } from './AbstractSolanaClient';
import { Solidr } from './types/solidr';
import { generateSessionLinkTokenData } from './TokenHelpers';

export type Global = {
    sessionCount: BN;
};

type InternalSessionStatus =
    | ({ closed?: never } & { opened: Record<string, never> })
    | ({ opened?: never } & {
          closed: Record<string, never>;
      });

type InternalSession = {
    sessionId: BN;
    name: string;
    description: string;
    status: InternalSessionStatus;
    admin: PublicKey;
    expensesCount: number;
    refundsCount: number;
    invitationHash: number[];
};

type InternalExpense = {
    sessionId: BN;
    expenseId: number;
    name: string;
    owner: PublicKey;
    date: BN;
    amount: number;
    participants: PublicKey[];
};

type InternalRefund = {
    sessionId: BN;
    refundId: number;
    date: BN;
    from: PublicKey;
    to: PublicKey;
    amount: number;
    amountInLamports: BN;
};

export enum SessionStatus {
    Opened = 'opened',
    Closed = 'closed',
}

export type Session = {
    sessionId: BN;
    name: string;
    description: string;
    status: SessionStatus;
    admin: PublicKey;
    expensesCount: number;
    refundsCount: number;
    invitationHash: string;
};

export type SessionMember = {
    sessionId: BN;
    name: string;
    addr: PublicKey;
    isAdmin: boolean;
};

export type Expense = {
    sessionId: BN;
    expenseId: number;
    name: string;
    owner: PublicKey;
    date: Date;
    amount: number;
    participants: PublicKey[];
};

export type Refund = {
    sessionId: BN;
    refundId: number;
    date: Date;
    from: PublicKey;
    to: PublicKey;
    amount: number;
    amountInLamports: BN;
};

export const MISSING_INVITATION_HASH = new Array(32).fill(0).toString();

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

    public async openSession(admin: Wallet, name: string, description: string, memberName: string): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionId = await this.getNextSessionId();
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const memberAccountAddress = this.findSessionMemberAccountAddress(sessionId, admin.publicKey);

            const tx = await this.program.methods
                .openSession(name, description, memberName)
                .accountsPartial({
                    global: this.globalAccountPubkey,
                    admin: admin.publicKey,
                    session: sessionAccountPubkey,
                    member: memberAccountAddress,
                })
                .transaction();

            return this.signAndSendTransaction(admin, tx, {
                sessionAccountPubkey,
                memberAccountAddress,
            });
        });
    }

    public async closeSession(admin: Wallet, sessionId: BN): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);

            const tx = await this.program.methods
                .closeSession()
                .accountsPartial({
                    admin: admin.publicKey,
                    session: sessionAccountPubkey,
                })
                .transaction();

            return this.signAndSendTransaction(admin, tx, {
                sessionAccountPubkey,
            });
        });
    }

    public async generateSessionLink(
        admin: Wallet,
        sessionId: BN,
    ): Promise<
        ITransactionResult<{
            token: string;
            hash: string;
        }>
    > {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);

            const { token, hash } = generateSessionLinkTokenData(sessionId.toString(), admin.payer);

            const tx = await this.program.methods
                .setSessionTokenHash([...hash])
                .accountsPartial({
                    admin: admin.publicKey,
                    session: sessionAccountPubkey,
                })
                .transaction();

            return this.signAndSendTransaction(admin, tx, { sessionAccountPubkey }, { token, hash });
        });
    }

    public async joinSessionAsMember(payer: Wallet, sessionId: BN, name: string, tokenBase64: string): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const memberAccountAddress = this.findSessionMemberAccountAddress(sessionId, payer.publicKey);

            const tx = await this.program.methods
                .joinSessionAsMember(name, tokenBase64)
                .accountsPartial({
                    signer: payer.publicKey,
                    session: sessionAccountPubkey,
                    member: memberAccountAddress,
                })
                .transaction();

            return this.signAndSendTransaction(payer, tx, {
                sessionAccountPubkey,
                memberAccountAddress,
            });
        });
    }

    public async addSessionMember(payer: Wallet, sessionId: BN, addr: PublicKey, name: string): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const memberAccountAddress = this.findSessionMemberAccountAddress(sessionId, addr);

            const tx = await this.program.methods
                .addSessionMember(addr, name)
                .accountsPartial({
                    admin: payer.publicKey,
                    session: sessionAccountPubkey,
                    member: memberAccountAddress,
                })
                .transaction();

            return this.signAndSendTransaction(payer, tx, {
                memberAccountAddress,
            });
        });
    }

    public async getSession(sessionAccountPubkey: PublicKey): Promise<Session> {
        return this.wrapFn(async () => {
            const internal = await this.program.account.sessionAccount.fetch(sessionAccountPubkey);
            return this.mapSession(internal);
        });
    }

    public async listUserSessions(
        memberAccountPubkey: PublicKey,
        paginationOptions?: {
            page: number;
            perPage: number;
        },
    ): Promise<Session[]> {
        return this.wrapFn(async () => {
            const memberAccountDiscriminator = Buffer.from(sha256.digest('account:MemberAccount')).subarray(0, 8);
            const accounts = await this.connection.getProgramAccounts(this.program.programId, {
                dataSlice: { offset: 8, length: 8 },
                filters: [
                    { memcmp: { offset: 0, bytes: bs58.encode(memberAccountDiscriminator) } }, // Ensure it's a MemberAccount account.
                    { memcmp: { offset: 8 + 8, bytes: memberAccountPubkey.toBase58() } },
                ],
            });
            const addresses = accounts
                .map(({ account }) => ({ sessionId: new BN(account.data, 'le') }))
                .sort((a, b) => a.sessionId.toNumber() - b.sessionId.toNumber())
                .map((account) => this.findSessionAccountAddress(account.sessionId));

            return (await this.getPage<InternalSession>(this.program.account.sessionAccount, addresses, paginationOptions?.page, paginationOptions?.perPage)).map(this.mapSession);
        });
    }

    public findSessionAccountAddress(sessionId: BN): PublicKey {
        const [sessionAccountPubkey] = PublicKey.findProgramAddressSync([Buffer.from('session'), sessionId.toBuffer('le', 8)], this.program.programId);
        return sessionAccountPubkey;
    }

    public async getSessionMember(memberAccountPubkey: PublicKey): Promise<SessionMember> {
        return this.wrapFn(async () => {
            return this.program.account.memberAccount.fetch(memberAccountPubkey);
        });
    }

    public async listSessionMembers(
        sessionId: BN,
        paginationOptions?: {
            page: number;
            perPage: number;
        },
    ): Promise<SessionMember[]> {
        return this.wrapFn(async () => {
            const memberAccountDiscriminator = Buffer.from(sha256.digest('account:MemberAccount')).subarray(0, 8);
            const accounts = await this.connection.getProgramAccounts(this.program.programId, {
                dataSlice: { offset: 8 + 8 + 32, length: 4 + 40 }, // name
                filters: [
                    { memcmp: { offset: 0, bytes: bs58.encode(memberAccountDiscriminator) } }, // Ensure it's a MemberAccount account.
                    { memcmp: { offset: 8, bytes: bs58.encode(sessionId.toBuffer()) } },
                ],
            });
            const addresses = accounts
                .map(({ pubkey, account }) => {
                    const len = account.data.subarray(0, 4).readUInt32LE(0);
                    return {
                        pubkey,
                        name: account.data.subarray(4, 4 + len).toString('utf8'),
                    };
                })
                .sort((a, b) => +(a.name > b.name) || -(a.name < b.name))
                .map((account) => account.pubkey);

            return this.getPage(this.program.account.memberAccount, addresses, paginationOptions?.page, paginationOptions?.perPage);
        });
    }

    public findSessionMemberAccountAddress(sessionId: BN, memberPubkey: PublicKey): PublicKey {
        const [sessionMemberAccountPubkey] = PublicKey.findProgramAddressSync(
            [Buffer.from('member'), sessionId.toBuffer('le', 8), memberPubkey.toBuffer()],
            this.program.programId,
        );
        return sessionMemberAccountPubkey;
    }

    public async addExpense(member: Wallet, sessionId: BN, name: string, amount: number, participants?: PublicKey[]): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const memberAccountPubkey = this.findSessionMemberAccountAddress(sessionId, member.publicKey);
            const expenseId = await this.getNextExpenseId(sessionAccountPubkey);
            const expenseAccountPubkey = this.findExpenseAccountAddress(sessionId, expenseId);

            const tx = await this.program.methods
                .addExpense(name, amount, participants || [])
                .accountsPartial({
                    owner: member.publicKey,
                    member: memberAccountPubkey,
                    session: sessionAccountPubkey,
                    expense: expenseAccountPubkey,
                })
                .remainingAccounts(
                    _.map(participants, (p) => ({
                        pubkey: this.findSessionMemberAccountAddress(sessionId, p),
                        isSigner: false,
                        isWritable: false,
                    })),
                )
                .transaction();

            return this.signAndSendTransaction(member, tx, {
                sessionAccountPubkey,
                memberAccountPubkey,
                expenseAccountPubkey,
            });
        });
    }

    public async updateExpense(member: Wallet, sessionId: BN, expenseId: BN, name: string, amount: number): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const memberAccountPubkey = this.findSessionMemberAccountAddress(sessionId, member.publicKey);
            const expenseAccountPubkey = this.findExpenseAccountAddress(sessionId, expenseId);

            const tx = await this.program.methods
                .updateExpense(name, amount)
                .accountsPartial({
                    owner: member.publicKey,
                    session: sessionAccountPubkey,
                    expense: expenseAccountPubkey,
                })
                .transaction();

            return this.signAndSendTransaction(member, tx, {
                sessionAccountPubkey,
                memberAccountPubkey,
                expenseAccountPubkey,
            });
        });
    }

    public async deleteExpense(member: Wallet, sessionId: BN, expenseId: BN): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const memberAccountPubkey = this.findSessionMemberAccountAddress(sessionId, member.publicKey);
            const expenseAccountPubkey = this.findExpenseAccountAddress(sessionId, expenseId);

            const tx = await this.program.methods
                .deleteExpense()
                .accountsPartial({
                    owner: member.publicKey,
                    session: sessionAccountPubkey,
                    expense: expenseAccountPubkey,
                })
                .transaction();

            return this.signAndSendTransaction(member, tx, {
                sessionAccountPubkey,
                memberAccountPubkey,
                expenseAccountPubkey,
            });
        });
    }

    public async listSessionExpenses(
        sessionId: BN,
        filters?: { owner?: PublicKey } | undefined,
        paginationOptions?: {
            page: number;
            perPage: number;
        },
    ): Promise<Expense[]> {
        return this.wrapFn(async () => {
            const expenseAccountDiscriminator = Buffer.from(sha256.digest('account:ExpenseAccount')).subarray(0, 8);
            const accounts = await this.connection.getProgramAccounts(this.program.programId, {
                dataSlice: { offset: 8 + 8 + 2, length: 8 }, // date
                filters: _.compact([
                    { memcmp: { offset: 0, bytes: bs58.encode(expenseAccountDiscriminator) } }, // Ensure it's a ExpenseAccount account.
                    { memcmp: { offset: 8, bytes: bs58.encode(sessionId.toBuffer()) } }, // sessionId
                    filters?.owner ? { memcmp: { offset: 8 + 8 + 2 + 8, bytes: filters.owner.toBase58() } } : undefined, // owner
                ]),
            });
            const addresses = accounts
                .map(({ pubkey, account }) => {
                    return {
                        pubkey,
                        date: new BN(account.data, 'le'),
                    };
                })
                .sort((a, b) => +(a.date > b.date) || -(a.date < b.date))
                .map((account) => account.pubkey);

            return (await this.getPage<InternalExpense>(this.program.account.expenseAccount, addresses, paginationOptions?.page, paginationOptions?.perPage)).map(this.mapExpense);
        });
    }

    public findExpenseAccountAddress(sessionId: BN, expenseId: BN): PublicKey {
        const [expenseAccountPubkey] = PublicKey.findProgramAddressSync([Buffer.from('expense'), sessionId.toBuffer('le', 8), expenseId.toBuffer('le', 2)], this.program.programId);
        return expenseAccountPubkey;
    }

    public async getExpense(expenseAccountPubkey: PublicKey): Promise<Expense> {
        return this.wrapFn(async () => {
            const expense = await this.program.account.expenseAccount.fetch(expenseAccountPubkey);
            return this.mapExpense(expense);
        });
    }

    public async addExpenseParticipants(owner: Wallet, sessionId: BN, expenseId: BN, participants: PublicKey[]): Promise<ITransactionResult> {
        const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
        const expenseAccountPubkey = this.findExpenseAccountAddress(sessionId, expenseId);

        const tx = await this.program.methods
            .addExpenseParticipants(participants)
            .accountsPartial({
                owner: owner.publicKey,
                expense: expenseAccountPubkey,
                session: sessionAccountPubkey,
            })
            .remainingAccounts(
                _.map(participants, (p) => ({
                    pubkey: this.findSessionMemberAccountAddress(sessionId, p),
                    isSigner: false,
                    isWritable: false,
                })),
            )
            .transaction();

        return this.signAndSendTransaction(owner, tx, {
            sessionAccountPubkey,
            expenseAccountPubkey,
        });
    }

    public async removeExpenseParticipants(owner: Wallet, sessionId: BN, expenseId: BN, participants: PublicKey[]): Promise<ITransactionResult> {
        const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
        const expenseAccountPubkey = this.findExpenseAccountAddress(sessionId, expenseId);

        const tx = await this.program.methods
            .removeExpenseParticipants(participants)
            .accountsPartial({
                owner: owner.publicKey,
                expense: expenseAccountPubkey,
                session: sessionAccountPubkey,
            })
            .remainingAccounts(
                _.map(participants, (p) => ({
                    pubkey: this.findSessionMemberAccountAddress(sessionId, p),
                    isSigner: false,
                    isWritable: false,
                })),
            )
            .transaction();

        return this.signAndSendTransaction(owner, tx, {
            sessionAccountPubkey,
            expenseAccountPubkey,
        });
    }

    public async addRefund(payer: Wallet, sessionId: BN, amount: number, recipient: PublicKey): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const fromMemberAccountPubkey = this.findSessionMemberAccountAddress(sessionId, payer.publicKey);
            const toMemberAccountPubkey = this.findSessionMemberAccountAddress(sessionId, recipient);

            const refundId = await this.getNextRefundId(sessionAccountPubkey);
            const refundAccountPubkey = this.findRefundAccountAddress(sessionId, refundId);

            const tx = await this.program.methods
                .addRefund(amount)
                .accountsPartial({
                    fromAddr: payer.publicKey,
                    sender: fromMemberAccountPubkey,
                    toAddr: recipient,
                    receiver: toMemberAccountPubkey,
                    session: sessionAccountPubkey,
                    refund: refundAccountPubkey,
                })
                .transaction();

            return this.signAndSendTransaction(payer, tx, {
                sessionAccountPubkey,
                fromMemberAccountPubkey,
                toMemberAccountPubkey,
                refundAccountPubkey,
            });
        });
    }

    public async listSessionRefunds(
        sessionId: BN,
        filters?: { from?: PublicKey; to?: PublicKey } | undefined,
        paginationOptions?: { page: number; perPage: number },
    ): Promise<Refund[]> {
        return this.wrapFn(async () => {
            const refundAccountDiscriminator = Buffer.from(sha256.digest('account:RefundAccount')).subarray(0, 8);
            const accounts = await this.connection.getProgramAccounts(this.program.programId, {
                dataSlice: { offset: 8 + 8 + 2, length: 8 }, // date
                filters: _.compact([
                    { memcmp: { offset: 0, bytes: bs58.encode(refundAccountDiscriminator) } }, // Ensure it's a RefundAccount account.
                    { memcmp: { offset: 8, bytes: bs58.encode(sessionId.toBuffer()) } }, // sessionId
                    filters?.from ? { memcmp: { offset: 8 + 8 + 2 + 8, bytes: filters.from.toBase58() } } : undefined, // from
                    filters?.to ? { memcmp: { offset: 8 + 8 + 2 + 8 + 32, bytes: filters.to.toBase58() } } : undefined, // to
                ]),
            });
            const addresses = accounts
                .map(({ pubkey, account }) => {
                    return {
                        pubkey,
                        date: new BN(account.data, 'le'),
                    };
                })
                .sort((a, b) => +(a.date > b.date) || -(a.date < b.date))
                .map((account) => account.pubkey);

            return (await this.getPage<InternalRefund>(this.program.account.refundAccount, addresses, paginationOptions?.page, paginationOptions?.perPage)).map(this.mapRefund);
        });
    }

    public findRefundAccountAddress(sessionId: BN, refundId: BN): PublicKey {
        const [expenseAccountPubkey] = PublicKey.findProgramAddressSync([Buffer.from('refund'), sessionId.toBuffer('le', 8), refundId.toBuffer('le', 2)], this.program.programId);
        return expenseAccountPubkey;
    }

    public async getRefund(refundAccountPubkey: PublicKey): Promise<Refund> {
        return this.wrapFn(async () => {
            const refund = await this.program.account.refundAccount.fetch(refundAccountPubkey);
            return this.mapRefund(refund);
        });
    }

    private mapSessionStatus(internalStatus: InternalSessionStatus): SessionStatus {
        if (internalStatus.opened) return SessionStatus.Opened;
        if (internalStatus.closed) return SessionStatus.Closed;
        throw new Error('Bad session status');
    }

    private mapSession = (internalSession: InternalSession): Session => {
        return {
            ...internalSession,
            status: this.mapSessionStatus(internalSession.status),
            invitationHash: internalSession.invitationHash.toString(),
        };
    };

    private mapExpense = (internalExpense: InternalExpense): Expense => {
        return {
            ...internalExpense,
            date: new Date(internalExpense.date.toNumber() * 1000),
        };
    };

    private mapRefund = (internalRefund: InternalRefund): Refund => {
        return {
            ...internalRefund,
            date: new Date(internalRefund.date.toNumber() * 1000),
        };
    };

    private async getNextSessionId(): Promise<BN> {
        return this.wrapFn(async () => {
            const sessionCount = (await this.program.account.globalAccount.fetch(this.globalAccountPubkey)).sessionCount ?? 0;
            return new BN(sessionCount);
        });
    }

    private async getNextExpenseId(sessionAccountPubkey: PublicKey): Promise<BN> {
        return this.wrapFn(async () => {
            const expensesCount = (await this.program.account.sessionAccount.fetch(sessionAccountPubkey)).expensesCount ?? 0;
            return new BN(expensesCount);
        });
    }

    private async getNextRefundId(sessionAccountPubkey: PublicKey): Promise<BN> {
        return this.wrapFn(async () => {
            const refundsCount = (await this.program.account.sessionAccount.fetch(sessionAccountPubkey)).refundsCount ?? 0;
            return new BN(refundsCount);
        });
    }
}
