import * as _ from 'lodash';
import * as anchor from '@coral-xyz/anchor';
import { Program, Wallet } from '@coral-xyz/anchor';
import { assert } from 'chai';
import { SessionStatus, Solidr, SolidrClient } from '../client';
import { assertError } from './test.helpers';

describe('solidr', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.solidr as Program<Solidr>;
    const connection = program.provider.connection;

    const administrator = provider.wallet as anchor.Wallet;

    const alice = new Wallet(anchor.web3.Keypair.generate());

    const client = new SolidrClient(program, { skipPreflight: false, preflightCommitment: 'confirmed' });

    before(async () => {
        // initialize program global account
        await client.initGlobal(administrator);

        // request airdrop for voting actors
        await client.airdrop(alice.publicKey, 100);
    });

    it('> should set session counter to zero', async () => {
        const globalPubkey = await client.findGlobalAccountAddress();
        const globalAccount = await client.getGlobalAccount(globalPubkey);
        assert.equal(globalAccount.sessionCount.toNumber(), 0);
    });

    describe('> createVotingSession', () => {
        it('> should succeed when called with program deployer account', async () => {
            const expectedSessionId = 0;
            const name = 'Session A';
            const description = 'New session A';

            const { accounts, events } = await client.openSession(administrator, name, description);
            const session = await client.getSession(accounts.sessionAccountPubkey);
            assert.equal(session.sessionId.toNumber(), expectedSessionId);
            assert.equal(session.admin.toString(), administrator.payer.publicKey.toString());
            assert.equal(session.name, name);
            assert.equal(session.description, description);
            assert.deepEqual(session.status, SessionStatus.Opened);
            assert.equal(session.membersCount, 0); // TODO: admin should be added during session created
            assert.equal(session.expensesCount, 0);

            const { sessionOpened } = events;
            assert.equal(sessionOpened.sessionId.toNumber(), expectedSessionId);
        });

        it('> should succeed when called with non deployer account', async () => {
            const expectedSessionId = 1;
            const name = 'Session B';
            const description = 'New session B';

            const {
                events,
                accounts: { sessionAccountPubkey },
            } = await client.openSession(alice, name, description);

            const session = await client.getSession(sessionAccountPubkey);
            assert.equal(session.sessionId.toNumber(), expectedSessionId);
            assert.equal(session.admin.toString(), alice.publicKey.toString());
            assert.equal(session.name, name);
            assert.equal(session.description, description);
            assert.deepEqual(session.status, SessionStatus.Opened);
            assert.equal(session.membersCount, 0); // TODO: admin should be added during session created
            assert.equal(session.expensesCount, 0);

            const { sessionOpened } = events;
            assert.equal(sessionOpened.sessionId.toNumber(), expectedSessionId);
        });

        it('> should fail when called with too long name', async () => {
            const longName = _.times(21, () => 'X').join('');
            await assertError(async () => client.openSession(alice, longName, ''), {
                number: 6000,
                code: 'SessionNameTooLong',
                message: `Session's name can't exceed 20 characters`,
                programId: program.programId.toString(),
            });
        });

        it('> should fail when called with too long description', async () => {
            const longDescription = _.times(81, () => 'X').join('');
            await assertError(async () => client.openSession(alice, 'name', longDescription), {
                number: 6001,
                code: 'SessionDescriptionTooLong',
                message: `Session's description can't exceed 80 characters`,
                programId: program.programId.toString(),
            });
        });
    });
});
