import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { PublicKey, SendOptions, Transaction, TransactionInstruction } from '@solana/web3.js';
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

export type MemberBalance = {
    owner: PublicKey;
    balance: number;
    totalCost: number;
};

export type MemberTransfer = {
    from: PublicKey;
    to: PublicKey;
    amount: number;
};

export type MemberRefund = {
    to: PublicKey;
    amount: number;
};

export type Balance = {
    totalExpenses: number;
    totalRefunds: number;
    members: { [key: string]: MemberBalance };
    transfers: MemberTransfer[];
};

export const MISSING_INVITATION_HASH = new Array(32).fill(0).toString();

export class SolidrClient extends AbstractSolanaClient<Solidr> {
    public readonly globalAccountPubkey: PublicKey;

    constructor(program: Program<Solidr>, options?: SendOptions, wrapFn?: ProgramInstructionWrapper<Solidr>) {
        super(program, options, wrapFn);
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
            const sessionId = await this._getNextSessionId();
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

    public async updateSession(admin: Wallet, sessionId: BN, name: string, description: string): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);

            const tx = await this.program.methods
                .updateSession(name, description)
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

    public async deleteSession(admin: Wallet, sessionId: BN): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);

            let instructions: TransactionInstruction[] = [];
            const expenses = await this.listSessionExpenses(sessionId);
            for (const expense of expenses) {
                const instruction = await this.program.methods
                    .deleteExpense()
                    .accountsPartial({
                        owner: admin.publicKey,
                        session: sessionAccountPubkey,
                        expense: this.findExpenseAccountAddress(sessionId, new BN(expense.expenseId)),
                    })
                    .instruction();
                instructions.push(instruction);
            }
            const refunds = await this.listSessionRefunds(sessionId);
            for (const refund of refunds) {
                const instruction = await this.program.methods
                    .deleteRefund()
                    .accountsPartial({
                        admin: admin.publicKey,
                        session: sessionAccountPubkey,
                        refund: this.findRefundAccountAddress(sessionId, new BN(refund.refundId)),
                    })
                    .instruction();
                instructions.push(instruction);
            }
            const members = await this.listSessionMembers(sessionId);
            for (const member of members) {
                const instruction = await this.program.methods
                    .deleteSessionMember()
                    .accountsPartial({
                        admin: admin.publicKey,
                        session: sessionAccountPubkey,
                        member: this.findSessionMemberAccountAddress(sessionId, member.addr),
                    })
                    .instruction();
                instructions.push(instruction);
            }
            const tx = await this.program.methods
                .deleteSession()
                .accountsPartial({
                    admin: admin.publicKey,
                    session: sessionAccountPubkey,
                })
                .preInstructions(instructions)
                .transaction();

            return this.signAndSendTransaction(admin, tx, {
                sessionAccountPubkey,
            });
        });
    }

    public async computeBalance(sessionMembers: SessionMember[], expenses: Expense[], refunds: Refund[]): Promise<Balance> {
        return this.wrapFn(async () => {
            const members = sessionMembers.reduce(
                (members, member) => {
                    members[member.addr.toString()] = { owner: member.addr, balance: 0, totalCost: 0 };
                    return members;
                },
                {} as { [key: string]: MemberBalance },
            );

            let totalExpenses = 0;
            let totalRefunds = 0;

            // 1. Compute total of expenses and individual costs for each member
            for (const expense of expenses) {
                members[expense.owner.toString()].balance += expense.amount;
                totalExpenses += expense.amount;

                const shareAmount = expense.amount / expense.participants.length;
                for (const participant of expense.participants) {
                    const participantKey = participant.toString();
                    members[participantKey].balance -= shareAmount;
                    members[participantKey].totalCost += shareAmount;
                }
            }

            // 2. Apply refunds
            for (const refund of refunds) {
                totalRefunds += refund.amount;
                members[refund.from.toString()].balance += refund.amount;
                members[refund.to.toString()].balance -= refund.amount;
            }

            // 3. Separate debtors and creditors, and round balances
            const debtors: MemberBalance[] = [];
            const creditors: MemberBalance[] = [];

            for (const member of Object.values(members)) {
                const roundedBalance = this._round2Precision(member.balance);
                member.balance = roundedBalance === 0 ? 0 : roundedBalance; // hack to remove "-0"
                member.totalCost = this._round2Precision(member.totalCost);
                if (member.balance < 0) {
                    debtors.push({ ...member });
                } else if (member.balance > 0) {
                    creditors.push({ ...member });
                }
            }

            // 4. Calculate transfers
            const transfers: MemberTransfer[] = [];

            while (debtors.length > 0 && creditors.length > 0) {
                const debtor = debtors[0];
                const creditor = creditors[0];

                const transferAmount = this._round2Precision(Math.min(Math.abs(debtor.balance), creditor.balance));

                transfers.push({
                    from: debtor.owner,
                    to: creditor.owner,
                    amount: transferAmount,
                });

                debtor.balance = this._round2Precision(debtor.balance + transferAmount);
                creditor.balance = this._round2Precision(creditor.balance - transferAmount);

                if (debtor.balance === 0) debtors.shift();
                if (creditor.balance === 0) creditors.shift();
            }
            return { totalExpenses, totalRefunds, members, transfers };
        });
    }

    private _round2Precision = (amount: number) => {
        return Math.round(amount * 100) / 100;
    };

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

            const { token, hash } = generateSessionLinkTokenData(sessionId.toString(), admin.publicKey);

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
            const memberAccountPubkey = this.findSessionMemberAccountAddress(sessionId, addr);

            const tx = await this.program.methods
                .addSessionMember(addr, name)
                .accountsPartial({
                    admin: payer.publicKey,
                    session: sessionAccountPubkey,
                    member: memberAccountPubkey,
                })
                .transaction();

            return this.signAndSendTransaction(payer, tx, {
                memberAccountPubkey,
            });
        });
    }

    public async updateSessionMember(payer: Wallet, sessionId: BN, addr: PublicKey, name: string): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const memberAccountPubkey = this.findSessionMemberAccountAddress(sessionId, addr);

            const tx = await this.program.methods
                .updateSessionMember(name)
                .accountsPartial({
                    admin: payer.publicKey,
                    session: sessionAccountPubkey,
                    member: memberAccountPubkey,
                })
                .transaction();

            return this.signAndSendTransaction(payer, tx, {
                memberAccountPubkey,
            });
        });
    }

    public async deleteSessionMember(payer: Wallet, sessionId: BN, addr: PublicKey): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const memberAccountAddress = this.findSessionMemberAccountAddress(sessionId, addr);

            const tx = await this.program.methods
                .deleteSessionMember()
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
            return this._mapSession(internal);
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

            return (await this.getPage<InternalSession>(this.program.account.sessionAccount, addresses, paginationOptions?.page, paginationOptions?.perPage)).map(this._mapSession);
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
            const expenseId = await this._getNextExpenseId(sessionAccountPubkey);
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

            return (await this.getPage<InternalExpense>(this.program.account.expenseAccount, addresses, paginationOptions?.page, paginationOptions?.perPage)).map(this._mapExpense);
        });
    }

    public findExpenseAccountAddress(sessionId: BN, expenseId: BN): PublicKey {
        const [expenseAccountPubkey] = PublicKey.findProgramAddressSync([Buffer.from('expense'), sessionId.toBuffer('le', 8), expenseId.toBuffer('le', 2)], this.program.programId);
        return expenseAccountPubkey;
    }

    public async getExpense(expenseAccountPubkey: PublicKey): Promise<Expense> {
        return this.wrapFn(async () => {
            const expense = await this.program.account.expenseAccount.fetch(expenseAccountPubkey);
            return this._mapExpense(expense);
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

    public async sendRefunds(payer: Wallet, sessionId: BN, refundsToSend: MemberRefund[]): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const fromMemberAccountPubkey = this.findSessionMemberAccountAddress(sessionId, payer.publicKey);

            let refundId = await this._getNextRefundId(sessionAccountPubkey);

            let instructions: TransactionInstruction[] = [];
            let refundsAccountPubkeys: NodeJS.Dict<PublicKey> = {};
            for (const transfer of refundsToSend) {
                const toMemberAccountPubkey = this.findSessionMemberAccountAddress(sessionId, transfer.to);
                const refundAccountPubkey = this.findRefundAccountAddress(sessionId, refundId);
                refundId = new BN(refundId + 1);

                // All accounts available: https://pyth.network/developers/accounts?cluster=solana-devnet
                const solPriceAccount = new PublicKey('3Mnn2fX6rQyUsyELYms1sBJyChWofzSNRoqYzvgMVz5E'); // Crypto.SOL/USD

                const instruction = await this.program.methods
                    .addRefund(transfer.amount)
                    .accountsPartial({
                        fromAddr: payer.publicKey,
                        sender: fromMemberAccountPubkey,
                        toAddr: transfer.to,
                        receiver: toMemberAccountPubkey,
                        session: sessionAccountPubkey,
                        refund: refundAccountPubkey,
                        priceUpdate: solPriceAccount,
                    })
                    .instruction();
                refundsAccountPubkeys = { ...refundsAccountPubkeys, refundAccountPubkey };
                instructions.push(instruction);
            }

            const tx = new Transaction().add(...instructions);

            return this.signAndSendTransaction(payer, tx, {
                sessionAccountPubkey,
                fromMemberAccountPubkey,
                ...refundsAccountPubkeys,
            });
        });
    }

    public async deleteRefund(payer: Wallet, sessionId: BN, refundId: BN): Promise<ITransactionResult> {
        return this.wrapFn(async () => {
            const sessionAccountPubkey = this.findSessionAccountAddress(sessionId);
            const refundAccountPubkey = this.findRefundAccountAddress(sessionId, refundId);

            const tx = await this.program.methods
                .deleteRefund()
                .accountsPartial({
                    admin: payer.publicKey,
                    session: sessionAccountPubkey,
                    refund: refundAccountPubkey,
                })
                .transaction();

            return this.signAndSendTransaction(payer, tx, {
                sessionAccountPubkey,
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

            return (await this.getPage<InternalRefund>(this.program.account.refundAccount, addresses, paginationOptions?.page, paginationOptions?.perPage)).map(this._mapRefund);
        });
    }

    public findRefundAccountAddress(sessionId: BN, refundId: BN): PublicKey {
        const [expenseAccountPubkey] = PublicKey.findProgramAddressSync([Buffer.from('refund'), sessionId.toBuffer('le', 8), refundId.toBuffer('le', 2)], this.program.programId);
        return expenseAccountPubkey;
    }

    public async getRefund(refundAccountPubkey: PublicKey): Promise<Refund> {
        return this.wrapFn(async () => {
            const refund = await this.program.account.refundAccount.fetch(refundAccountPubkey);
            return this._mapRefund(refund);
        });
    }

    private _mapSessionStatus(internalStatus: InternalSessionStatus): SessionStatus {
        if (internalStatus.opened) return SessionStatus.Opened;
        if (internalStatus.closed) return SessionStatus.Closed;
        throw new Error('Bad session status');
    }

    private _mapSession = (internalSession: InternalSession): Session => {
        return {
            ...internalSession,
            status: this._mapSessionStatus(internalSession.status),
            invitationHash: internalSession.invitationHash.toString(),
        };
    };

    private _mapExpense = (internalExpense: InternalExpense): Expense => {
        return {
            ...internalExpense,
            amount: Math.round(internalExpense.amount * 100) / 100,
            date: new Date(internalExpense.date.toNumber() * 1000),
        };
    };

    private _mapRefund = (internalRefund: InternalRefund): Refund => {
        return {
            ...internalRefund,
            date: new Date(internalRefund.date.toNumber() * 1000),
        };
    };

    private async _getNextSessionId(): Promise<BN> {
        return this.wrapFn(async () => {
            const sessionCount = (await this.program.account.globalAccount.fetch(this.globalAccountPubkey)).sessionCount ?? 0;
            return new BN(sessionCount);
        });
    }

    private async _getNextExpenseId(sessionAccountPubkey: PublicKey): Promise<BN> {
        return this.wrapFn(async () => {
            const expensesCount = (await this.program.account.sessionAccount.fetch(sessionAccountPubkey)).expensesCount ?? 0;
            return new BN(expensesCount);
        });
    }

    private async _getNextRefundId(sessionAccountPubkey: PublicKey): Promise<BN> {
        return this.wrapFn(async () => {
            const refundsCount = (await this.program.account.sessionAccount.fetch(sessionAccountPubkey)).refundsCount ?? 0;
            return new BN(refundsCount);
        });
    }
}
