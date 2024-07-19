import { AnchorError } from '@coral-xyz/anchor';
import { assert } from 'chai';

export const ACCOUNT_NOT_FOUND = `Error: Account does not exist or has no data`;
export const ACCOUNT_NOT_INITIALIZED = `The program expected this account to be already initialized`;

export interface IExpectedError {
    code?: string;
    message: string;
}

export async function assertError(fn: () => Promise<any>, expected: IExpectedError): Promise<void> {
    try {
        await fn();
        assert.ok(false, 'NO_ERROR');
    } catch (_err) {
        if (_err.logs) {
            assert.isArray(_err.logs);
            const err = AnchorError.parse(_err.logs);
            //console.log('err :>> ', err);
            expected.code && assert.strictEqual(err.error.errorCode.code, expected.code);
            assert.strictEqual(err.error.errorMessage, expected.message);
        } else {
            //console.log('_err', _err);
            const message = _err.toString();
            if (message.match(/NO_ERROR/)) throw new Error('No error thrown');
            assert.include(message, expected.message);
        }
    }
}
