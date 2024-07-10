import * as _ from 'lodash';
import * as anchor from '@coral-xyz/anchor';
import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { assert } from 'chai';
import { MISSING_INVITATION_HASH, SessionStatus, Solidr, SolidrClient } from '../client';
import { assertError } from './test.helpers';
import { hashToken } from '../client/TokenHelpers';

describe('solidr', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.solidr as Program<Solidr>;

    const administrator = provider.wallet as anchor.Wallet;

    const alice = new Wallet(anchor.web3.Keypair.generate());
    const bob = new Wallet(anchor.web3.Keypair.generate());

    const client = new SolidrClient(program, { skipPreflight: false, preflightCommitment: 'confirmed' });

    before(async () => {
        await client.initGlobal(administrator);
        await client.airdrop(alice.publicKey, 100);
        await client.airdrop(bob.publicKey, 100);
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
            assert.equal(session.expensesCount, 0);
            assert.sameOrderedMembers(session.invitationHash, MISSING_INVITATION_HASH);

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
            assert.equal(session.expensesCount, 0);
            assert.sameOrderedMembers(session.invitationHash, MISSING_INVITATION_HASH);

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

    context('> Voting session is opened', () => {
        let sessionId: BN;

        beforeEach(async () => {
            const {
                accounts: { sessionAccountPubkey },
            } = await client.openSession(alice, 'Weekend', 'A weekend with friends');
            const session = await client.getSession(sessionAccountPubkey);
            sessionId = session.sessionId;
        });

        describe('> add session member', () => {
            it('> should create member pda', async () => {
                const {
                    accounts: { memberAccountAddress },
                    events: { memberAdded },
                } = await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');

                const member = await client.getSessionMember(memberAccountAddress);
                assert.equal(member.name, 'Bob');
                assert.equal(member.addr.toString(), bob.publicKey.toString());

                assert.equal(memberAdded.sessionId.toNumber(), sessionId.toNumber());
                assert.equal(memberAdded.name, 'Bob');
                assert.equal(memberAdded.addr.toString(), bob.publicKey.toString());
            });

            it('> should fail when called non session administrator', async () => {
                await assertError(async () => client.addSessionMember(bob, sessionId, bob.publicKey, 'Bob'), {
                    number: 6002,
                    code: 'ForbiddenAsNonAdmin',
                    message: `Only session administrator is granted`,
                    programId: program.programId.toString(),
                });
            });

            it('> should fail when called for already registered member', async () => {
                await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');

                await assertError(async () => client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob'), {
                    number: 6004,
                    code: 'MemberAlreadyExists',
                    message: `Member already exists`,
                    programId: program.programId.toString(),
                });
            });
        });

        describe('> create invitation link', () => {
            it('> should fail with invalid sessionId', async () => {
                await assertError(async () => client.generateSessionLink(alice, new BN(100)), {
                    number: 3012,
                    code: 'AccountNotInitialized',
                    message: `The program expected this account to be already initialized`,
                    programId: program.programId.toString(),
                });
            });

            it('> should fail when called with non administrator', async () => {
                await assertError(async () => client.generateSessionLink(bob, sessionId), {
                    number: 6002,
                    code: 'ForbiddenAsNonAdmin',
                    message: `Only session administrator is granted`,
                    programId: program.programId.toString(),
                });
            });

            it('> should prevent anybody to join session without generated token', async () => {
                await assertError(async () => client.joinSessionAsMember(bob, sessionId, 'Bob', 'bad_token'), {
                    number: 6005,
                    code: 'MissingInvitationHash',
                    message: `Missing invitation link hash`,
                    programId: program.programId.toString(),
                });
            });

            it('> should set new invitation hash in session account', async () => {
                const {
                    data: { token },
                    accounts: { sessionAccountPubkey },
                } = await client.generateSessionLink(alice, sessionId);
                const session = await client.getSession(sessionAccountPubkey);
                assert.sameOrderedMembers(session.invitationHash, [...hashToken(token)]);
            });

            it('> should allow anybody to join session as member with correct token', async () => {
                const {
                    data: { token },
                } = await client.generateSessionLink(alice, sessionId);
                await client.joinSessionAsMember(bob, sessionId, 'Bob', token);
            });

            it('> should prevent anybody to join session with wrong token', async () => {
                await client.generateSessionLink(alice, sessionId);
                await assertError(async () => client.joinSessionAsMember(bob, sessionId, 'Bob', 'bad_token'), {
                    number: 6006,
                    code: 'InvalidInvitationHash',
                    message: `Invalid invitation link hash`,
                    programId: program.programId.toString(),
                });
            });
        });
    });
});
