import { AnchorError } from '@coral-xyz/anchor';
import { assert } from 'chai';

export interface IExpectedError {
    code: string;
    number: number;
    message: string;
    programId: string;
}

export async function assertError(fn: () => Promise<any>, expected: IExpectedError): Promise<void> {
    try {
        await fn();
        assert.ok(false, 'No error thrown');
    } catch (_err) {
        assert.isArray(_err.logs);
        const err = AnchorError.parse(_err.logs);
        // console.log('err :>> ', err);
        assert.strictEqual(err.error.errorMessage, expected.message);
        assert.strictEqual(err.error.errorCode.code, expected.code);
        assert.strictEqual(err.error.errorCode.number, expected.number);
        assert.strictEqual(err.program.toString(), expected.programId);
    }
}
