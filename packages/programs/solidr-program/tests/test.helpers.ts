import { AnchorError } from '@coral-xyz/anchor';
import { assert } from 'chai';

export const ACCOUNT_NOT_FOUND = `Error: Account does not exist or has no data`;

export interface IExpectedError {
    code?: string;
    number?: number;
    message: string;
    programId?: string;
}

export async function assertError(fn: () => Promise<any>, expected: IExpectedError): Promise<void> {
    try {
        await fn();
        assert.ok(false, 'No error thrown');
    } catch (_err) {
        console.log('err :>> ', _err);
        assert.isArray(_err.logs);
        const err = AnchorError.parse(_err.logs);
        //assert.strictEqual(err.error.errorCode.number, expected.number);
        assert.strictEqual(err.error.errorCode.code, expected.code);
        assert.strictEqual(err.error.errorMessage, expected.message);
        assert.strictEqual(err.program.toString(), expected.programId);
    }
}

export async function assertSimpleError(fn: () => Promise<any>, message: String): Promise<void> {
    try {
        await fn();
        assert.ok(false, 'No error thrown');
    } catch (_err) {
        //console.log('err :>> ', _err);
        assert.include(_err.toString(), message);
    }
}