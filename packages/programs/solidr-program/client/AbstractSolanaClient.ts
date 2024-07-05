import { Address, BorshCoder, EventParser, Idl, IdlEvents, Program, Wallet } from '@coral-xyz/anchor';
import { Connection, LAMPORTS_PER_SOL, PublicKey, SendOptions, Transaction, TransactionSignature } from '@solana/web3.js';
import * as _ from 'lodash';

export type ITransactionResult = {
    tx: string;
    accounts?: NodeJS.Dict<PublicKey>;
    events: any;
};

export type ProgramInstructionWrapper<T = any> = (fn: () => Promise<T>) => Promise<T>;

export class AbstractSolanaClient<T extends Idl> {
    public readonly program: Program<T>;
    public readonly connection: Connection;
    protected readonly options?: SendOptions;
    protected readonly wrapFn: ProgramInstructionWrapper;

    constructor(program: Program<T>, options?: SendOptions, wrapFn?: ProgramInstructionWrapper<T>) {
        this.program = program;
        this.connection = program.provider.connection;
        this.options = options;
        this.wrapFn = wrapFn || this._wrapFn.bind(this);
    }

    public async signAndSendTransaction(payer: Wallet, tx: Transaction, accounts?: NodeJS.Dict<PublicKey>): Promise<ITransactionResult> {
        const recentBlockhash = (await this.connection.getLatestBlockhash()).blockhash;
        tx.feePayer = payer.publicKey;
        tx.recentBlockhash = recentBlockhash;
        const signedTransaction = await payer.signTransaction(tx);
        const serializedTx = signedTransaction.serialize();
        const sentTx = await this.connection.sendRawTransaction(serializedTx, this.options);
        await this.confirmTx(sentTx);

        return {
            tx: sentTx,
            events: await this.getTxEvents(sentTx),
            accounts,
        };
    }

    protected async getPage<R>(account: any, addresses: Address[], page: number = 1, perPage: number = 200): Promise<R[]> {
        const paginatedPublicKeys = addresses.slice((page - 1) * perPage, page * perPage);
        if (paginatedPublicKeys.length === 0) {
            return [];
        }
        return account.fetchMultiple(paginatedPublicKeys);
    }

    public addEventListener<E extends keyof IdlEvents<T>>(
        eventName: E & string,
        callback: (event: IdlEvents<any>[E], slot: number, signature: string) => void,
    ): number | undefined {
        try {
            return this.program.addEventListener(eventName, callback);
        } catch (e) {
            // silent error. problem encountered on vite dev server because of esm
            return;
        }
    }

    public async airdrop(to: PublicKey, sol: number): Promise<void> {
        const txHash = await this.program.provider.connection.requestAirdrop(to, sol * LAMPORTS_PER_SOL);
        return this.confirmTx(txHash);
    }

    protected async _wrapFn(fn: () => Promise<T>): Promise<T> {
        try {
            return await fn();
        } catch (e) {
            throw e;
        }
    }

    private async confirmTx(txHash: string) {
        const blockhashInfo = await this.program.provider.connection.getLatestBlockhash();
        await this.program.provider.connection.confirmTransaction({
            blockhash: blockhashInfo.blockhash,
            lastValidBlockHeight: blockhashInfo.lastValidBlockHeight,
            signature: txHash,
        });
    }

    public async getLatestBlockhash(): Promise<string> {
        return (await this.connection.getLatestBlockhash()).blockhash;
    }

    private async getTxEvents(tx: string): Promise<NodeJS.Dict<any> | undefined> {
        return this.callWithRetry(async () => {
            const txDetails = await this.connection.getTransaction(tx, {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed',
            });
            if (!txDetails) return;

            try {
                const eventParser = new EventParser(this.program.programId, new BorshCoder(this.program.idl));
                // console.log('tx meta :>> ', txDetails?.meta);
                const events = eventParser.parseLogs(txDetails?.meta?.logMessages || []);
                // console.log('events :>> ', events.next());
                const result: NodeJS.Dict<object> = {};
                for (let event of events) {
                    result[event.name] = event.data;
                }
                return result;
            } catch (e) {
                return;
            }
        }, 200);
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private async callWithRetry(fn: () => Promise<any>, timeMs: number, retry: number = 10): Promise<any> {
        const call = async (attempt: number): Promise<any> => {
            try {
                const result = await fn();
                if (result !== undefined) {
                    return result;
                } else {
                    throw new Error('No result');
                }
            } catch (e) {
                if (attempt < retry) {
                    await this.delay(timeMs);
                    return call(attempt + 1);
                } else if (!e.message.match(/No result/)) {
                    throw new Error(`Maximum retries reached without success. Last error: ${e.stack}`);
                }
            }
        };

        return call(1);
    }
}
