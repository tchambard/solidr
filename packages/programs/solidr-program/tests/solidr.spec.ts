import * as _ from 'lodash';
import * as anchor from '@coral-xyz/anchor';
import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { assert } from 'chai';
import { MISSING_INVITATION_HASH, SessionMember, SessionStatus, Solidr, SolidrClient } from '../client';
import { assertError } from './test.helpers';
import { hashToken } from '../client/TokenHelpers';

describe('solidr', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.solidr as Program<Solidr>;

    const administrator = provider.wallet as anchor.Wallet;

    const alice = new Wallet(anchor.web3.Keypair.generate());
    const bob = new Wallet(anchor.web3.Keypair.generate());
    // keep zoe for listing tests
    const zoe = new Wallet(anchor.web3.Keypair.generate());

    const client = new SolidrClient(program, { skipPreflight: false, preflightCommitment: 'confirmed' });

    before(async () => {
        await client.initGlobal(administrator);
        await client.airdrop(alice.publicKey, 100);
        await client.airdrop(bob.publicKey, 100);
        await client.airdrop(zoe.publicKey, 100);
    });

    it('> should set session counter to zero', async () => {
        const globalPubkey = await client.findGlobalAccountAddress();
        const globalAccount = await client.getGlobalAccount(globalPubkey);
        assert.equal(globalAccount.sessionCount.toNumber(), 0);
    });

    describe('> listUserSessions', () => {
        it('> should return empty page', async () => {
            const page = await client.listUserSessions(zoe.publicKey);
            assert.isEmpty(page);
        });
    });

    describe('> openSession', () => {
        it('> should succeed when called with program deployer account', async () => {
            const expectedSessionId = 0;
            const name = 'Session A';
            const description = 'New session A';

            const {
                accounts: { sessionAccountPubkey, memberAccountAddress },
                events,
            } = await client.openSession(administrator, name, description, 'Admin');
            const session = await client.getSession(sessionAccountPubkey);
            assert.equal(session.sessionId.toNumber(), expectedSessionId);
            assert.equal(session.admin.toString(), administrator.payer.publicKey.toString());
            assert.equal(session.name, name);
            assert.equal(session.description, description);
            assert.deepEqual(session.status, SessionStatus.Opened);
            assert.equal(session.expensesCount, 0);
            assert.sameOrderedMembers(session.invitationHash, MISSING_INVITATION_HASH);

            const member = await client.getSessionMember(memberAccountAddress);
            assert.equal(member.name, 'Admin');
            assert.equal(member.addr.toString(), administrator.publicKey.toString());
            assert.isTrue(member.isAdmin);

            const { sessionOpened } = events;
            assert.equal(sessionOpened.sessionId.toNumber(), expectedSessionId);
        });

        it('> should succeed when called with non deployer account', async () => {
            const expectedSessionId = 1;
            const name = 'Session B';
            const description = 'New session B';

            const {
                events,
                accounts: { sessionAccountPubkey, memberAccountAddress },
            } = await client.openSession(alice, name, description, 'Alice');

            const session = await client.getSession(sessionAccountPubkey);
            assert.equal(session.sessionId.toNumber(), expectedSessionId);
            assert.equal(session.admin.toString(), alice.publicKey.toString());
            assert.equal(session.name, name);
            assert.equal(session.description, description);
            assert.deepEqual(session.status, SessionStatus.Opened);
            assert.equal(session.expensesCount, 0);
            assert.sameOrderedMembers(session.invitationHash, MISSING_INVITATION_HASH);

            const member = await client.getSessionMember(memberAccountAddress);
            assert.equal(member.name, 'Alice');
            assert.equal(member.addr.toString(), alice.publicKey.toString());
            assert.isTrue(member.isAdmin);

            const { sessionOpened } = events;
            assert.equal(sessionOpened.sessionId.toNumber(), expectedSessionId);
        });

        it('> should fail when called with too long name', async () => {
            const longName = _.times(21, () => 'X').join('');
            await assertError(async () => client.openSession(alice, longName, '', 'Alice'), {
                number: 6000,
                code: 'SessionNameTooLong',
                message: `Session's name can't exceed 20 characters`,
                programId: program.programId.toString(),
            });
        });

        it('> should fail when called with too long description', async () => {
            const longDescription = _.times(81, () => 'X').join('');
            await assertError(async () => client.openSession(alice, 'name', longDescription, 'Alice'), {
                number: 6001,
                code: 'SessionDescriptionTooLong',
                message: `Session's description can't exceed 80 characters`,
                programId: program.programId.toString(),
            });
        });
    });

    context('> session is opened', () => {
        let sessionId: BN;

        beforeEach(async () => {
            const {
                accounts: { sessionAccountPubkey },
            } = await client.openSession(alice, 'Weekend', 'A weekend with friends', 'Alice');
            const session = await client.getSession(sessionAccountPubkey);
            sessionId = session.sessionId;
        });

        describe('> listUserSessions', () => {
            it('> should return owned and joined sessions with pagination', async () => {
                // Alice create other session
                const r1 = await client.openSession(alice, 'Z2', 'Alice session', 'Alice');
                const s1 = r1.events.sessionOpened.sessionId;
                // Zoe join alice's session
                await client.addSessionMember(alice, s1, zoe.publicKey, 'Zoééé');

                // Zoe create multiple owned session
                const zoeSessionIds: string[] = [];
                for (let i = 1; i <= 5; i++) {
                    const r = await client.openSession(zoe, `Z${i}`, `Zoe session ${i}`, 'Zoe');
                    zoeSessionIds.push(r.events.sessionOpened.sessionId);
                }

                const page1 = await client.listUserSessions(zoe.publicKey, { page: 1, perPage: 5 });
                assert.sameDeepMembers(page1, [
                    {
                        sessionId: s1,
                        addr: zoe.publicKey,
                        name: 'Zoééé',
                        isAdmin: false,
                    },
                    {
                        sessionId: zoeSessionIds[0],
                        addr: zoe.publicKey,
                        name: 'Zoe',
                        isAdmin: true,
                    },
                    {
                        sessionId: zoeSessionIds[1],
                        addr: zoe.publicKey,
                        name: 'Zoe',
                        isAdmin: true,
                    },
                    {
                        sessionId: zoeSessionIds[2],
                        addr: zoe.publicKey,
                        name: 'Zoe',
                        isAdmin: true,
                    },
                    {
                        sessionId: zoeSessionIds[3],
                        addr: zoe.publicKey,
                        name: 'Zoe',
                        isAdmin: true,
                    },
                ]);

                const page2 = await client.listUserSessions(zoe.publicKey, { page: 2, perPage: 5 });
                assert.sameDeepMembers(page2, [
                    {
                        sessionId: zoeSessionIds[4],
                        addr: zoe.publicKey,
                        name: 'Zoe',
                        isAdmin: true,
                    },
                ]);
            });
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
                assert.isFalse(member.isAdmin);

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
                const {
                    accounts: { memberAccountAddress },
                } = await client.joinSessionAsMember(bob, sessionId, 'Bob', token);

                const member = await client.getSessionMember(memberAccountAddress);
                assert.equal(member.name, 'Bob');
                assert.equal(member.addr.toString(), bob.publicKey.toString());
                assert.isFalse(member.isAdmin);
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
