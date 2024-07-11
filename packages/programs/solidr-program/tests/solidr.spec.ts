import * as _ from 'lodash';
import * as anchor from '@coral-xyz/anchor';
import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { assert } from 'chai';
import { MISSING_INVITATION_HASH, SessionMember, SessionStatus, Solidr, SolidrClient } from '../client';
import { ACCOUNT_NOT_FOUND, assertError, assertSimpleError } from './test.helpers';
import { hashToken } from '../client/TokenHelpers';

describe('solidr', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.solidr as Program<Solidr>;

    const administrator = provider.wallet as anchor.Wallet;

    const alice = new Wallet(anchor.web3.Keypair.generate());
    const bob = new Wallet(anchor.web3.Keypair.generate());
    const charlie = new Wallet(anchor.web3.Keypair.generate());
    // keep zoe for listing tests
    const zoe = new Wallet(anchor.web3.Keypair.generate());

    const client = new SolidrClient(program, { skipPreflight: false, preflightCommitment: 'confirmed' });

    before(async () => {
        await client.initGlobal(administrator);
        await client.airdrop(alice.publicKey, 100);
        await client.airdrop(bob.publicKey, 100);
        await client.airdrop(charlie.publicKey, 100);
        await client.airdrop(zoe.publicKey, 100);
    });

    it('> should set session counter to zero', async () => {
        const globalPubkey = await client.findGlobalAccountAddress();
        const globalAccount = await client.getGlobalAccount(globalPubkey);
        assert.equal(globalAccount.sessionCount.toNumber(), 0);
    });

    describe.skip('> openSession', () => {
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
            assert.equal(session.invitationHash, MISSING_INVITATION_HASH);

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
            assert.equal(session.invitationHash, MISSING_INVITATION_HASH);

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
    describe.skip('> closeSession', () => {
        it('> should change session status and reset invitationHash', async () => {
            const name = 'Session C';
            const description = 'New session C';
            // setup
            const {
                events: openEvents,
                accounts: { sessionAccountPubkey },
            } = await client.openSession(administrator, name, description, 'Admin');
            const sid = openEvents.sessionOpened.sessionId;
            const {
                data: { token },
            } = await client.generateSessionLink(administrator, sid);
            let session = await client.getSession(sessionAccountPubkey);
            assert.deepEqual(session.status, SessionStatus.Opened);
            assert.equal(session.invitationHash, [...hashToken(token)].toString());
            // assert
            const { events: closeEvents } = await client.closeSession(administrator, sid);
            session = await client.getSession(sessionAccountPubkey);
            assert.equal(session.invitationHash, MISSING_INVITATION_HASH);
            assert.equal(closeEvents.sessionClosed.sessionId.toNumber(), sid);
        });
    });

    context.skip('> session is opened', () => {
        let sessionId: BN;

        beforeEach(async () => {
            const {
                accounts: { sessionAccountPubkey },
            } = await client.openSession(alice, 'Weekend', 'A weekend with friends', 'Alice');
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
                assert.equal(session.invitationHash, [...hashToken(token)].toString());
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

        context('> session is closed', () => {
            beforeEach(async () => {
                await client.closeSession(alice, sessionId);
            });

            describe('> add session member', () => {
                it('> should fail because session is closed', async () => {
                    await assertError(async () => client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob'), {
                        number: 6003,
                        code: 'SessionClosed',
                        message: `Session is closed`,
                        programId: program.programId.toString(),
                    });
                });
            });

            describe('> create invitation link', () => {
                it('> should fail because session is closed', async () => {
                    await assertError(async () => client.generateSessionLink(alice, sessionId), {
                        number: 6003,
                        code: 'SessionClosed',
                        message: `Session is closed`,
                        programId: program.programId.toString(),
                    });
                });
            });

            describe('> close session', () => {
                it('> should fail because session is closed', async () => {
                    await assertError(async () => client.closeSession(alice, sessionId), {
                        number: 6003,
                        code: 'SessionClosed',
                        message: `Session is closed`,
                        programId: program.programId.toString(),
                    });
                });
            });
        });
    });

    describe.skip('> listUserSessions', () => {
        it('> should return empty page', async () => {
            const page = await client.listUserSessions(zoe.publicKey);
            assert.isEmpty(page);
        });

        it('> should return owned and joined sessions with pagination', async () => {
            // Alice create other session
            const r1 = await client.openSession(alice, 'A', 'Alice session', 'Alice');
            const s1 = new BN(r1.events.sessionOpened.sessionId);
            // Zoe join alice's session
            await client.addSessionMember(alice, s1, zoe.publicKey, 'Zoééé');

            // Zoe create multiple owned session
            const zoeSessionIds: string[] = [];
            for (let i = 1; i <= 5; i++) {
                const r = await client.openSession(zoe, `Z${i}`, `Zoe session ${i}`, 'Zoe');
                zoeSessionIds.push(new BN(r.events.sessionOpened.sessionId));
            }

            const page1 = await client.listUserSessions(zoe.publicKey, { page: 1, perPage: 5 });
            assert.sameDeepMembers(page1, [
                {
                    sessionId: s1,
                    name: 'A',
                    description: 'Alice session',
                    admin: alice.publicKey,
                    expensesCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
                {
                    sessionId: zoeSessionIds[0],
                    name: 'Z1',
                    description: `Zoe session 1`,
                    admin: zoe.publicKey,
                    expensesCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
                {
                    sessionId: zoeSessionIds[1],
                    name: 'Z2',
                    description: `Zoe session 2`,
                    admin: zoe.publicKey,
                    expensesCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
                {
                    sessionId: zoeSessionIds[2],
                    name: 'Z3',
                    description: `Zoe session 3`,
                    admin: zoe.publicKey,
                    expensesCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
                {
                    sessionId: zoeSessionIds[3],
                    name: 'Z4',
                    description: `Zoe session 4`,
                    admin: zoe.publicKey,
                    expensesCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
            ]);

            const page2 = await client.listUserSessions(zoe.publicKey, { page: 2, perPage: 5 });
            assert.sameDeepMembers(page2, [
                {
                    sessionId: zoeSessionIds[4],
                    name: 'Z5',
                    description: `Zoe session 5`,
                    admin: zoe.publicKey,
                    expensesCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
            ]);
        });

        describe('> listSessionMembers', () => {
            it('> should return page with only admin member', async () => {
                const r = await client.openSession(alice, 'A', 'Alice session', 'Alice');
                const sessionId = new BN(r.events.sessionOpened.sessionId);
                const page = await client.listSessionMembers(sessionId);
                assert.sameDeepMembers(page, [
                    {
                        addr: alice.publicKey,
                        isAdmin: true,
                        name: 'Alice',
                        sessionId,
                    },
                ]);
            });

            it('> should return paginated session members ordered alphabetically', async () => {
                // Alice create a session
                const r = await client.openSession(alice, 'A', 'Alice session', 'Alice');
                const sessionId = new BN(r.events.sessionOpened.sessionId);
                // Add members
                await client.addSessionMember(alice, sessionId, zoe.publicKey, 'Zoé');
                await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');
                await client.addSessionMember(alice, sessionId, charlie.publicKey, 'Charlie');

                const page1 = await client.listSessionMembers(sessionId, { page: 1, perPage: 3 });
                assert.sameDeepMembers(page1, [
                    {
                        addr: alice.publicKey,
                        isAdmin: true,
                        name: 'Alice',
                        sessionId,
                    },
                    {
                        addr: bob.publicKey,
                        isAdmin: false,
                        name: 'Bob',
                        sessionId,
                    },
                    {
                        addr: charlie.publicKey,
                        isAdmin: false,
                        name: 'Charlie',
                        sessionId,
                    },
                ]);

                const page2 = await client.listSessionMembers(sessionId, { page: 2, perPage: 3 });
                assert.sameDeepMembers(page2, [
                    {
                        addr: zoe.publicKey,
                        isAdmin: false,
                        name: 'Zoé',
                        sessionId,
                    },
                ]);
            });
        });
    });

    describe('> addNewExpense', () => {

        let sessionId: BN;

        beforeEach(async () => {
            const { accounts } = await client.openSession(administrator, 'name', '', 'Admin');
            const session = await client.getSession(accounts.sessionAccountPubkey);
            sessionId = session.sessionId;
        });

        it('> should fail when called with invalid session id', async () => {
            const invalidSessionId = new BN(666);
            await assertSimpleError(async () => client.addExpense(administrator, invalidSessionId, 'name', 10), ACCOUNT_NOT_FOUND);
        });

        it('> should fail when called with amount equals to 0', async () => {
            await assertError(async () => {
                const invalidAmount = 0;
                return client.addExpense(administrator, sessionId, 'name', invalidAmount);
            }, {
                number: 6002,
                code: 'AmountMustBeGreaterThanZero',
                message: `Expense amount must be greater than zero`,
                programId: program.programId.toString(),
            });
        });

        it('> should fail when called with to long name', async () => {
            const longName = _.times(21, () => 'X').join('');
            await assertError(async () => client.addExpense(administrator, sessionId, longName, 10), {
                code: 'ExpenseNameTooLong',
                message: `Expense's name can't exceed 20 characters`,
                programId: program.programId.toString(),
            });
        });

        it.skip('> should fail when called with empty participant', async () => {

        });

        it('> should succeed when called by administrator ', async () => {
            const expectedExpenseId = 0;
            const name = 'expense1';
            const amount = 10;
            const timestampBefore = Math.floor(Date.now() / 1000) - 10; // sometimes, this timestamp is bigger than that set in expense !?

            const {
                events,
                accounts: { expenseAccountPubkey },
            } = await client.addExpense(administrator, sessionId, name, amount);

            const expense = await client.getExpense(expenseAccountPubkey);
            assert.equal(expense.name, name);
            assert.equal(expense.member.toString(), administrator.publicKey.toString());
            assert.isAtLeast(expense.date.toNumber(), timestampBefore);
            assert.isAtMost(expense.date.toNumber(), Math.floor(Date.now() / 1000));
            //assert.includeMembers(expense.participants, [administrator.publicKey]);

            const { expenseAdded } = events;
            assert.equal(expenseAdded.sessionId.toNumber(), sessionId);
            assert.equal(expenseAdded.expenseId, expectedExpenseId);
        });

        it('> should failed when called by a non member', async () => {

            await assertError(async () => client.addExpense(alice, sessionId, 'name', 10), {
                code: 'AccountNotInitialized',
                message: `The program expected this account to be already initialized`,
                programId: program.programId.toString(),
            });
        });

        it('> should succeed when called by a member ', async () => {
            const expectedExpenseId = 0;
            const name = 'expense1';
            const amount = 10;
            const timestampBefore = Math.floor(Date.now() / 1000) - 10;

            await client.addSessionMember(administrator, sessionId, alice.publicKey, 'alice');

            const {
                events,
                accounts: { expenseAccountPubkey },
            } = await client.addExpense(alice, sessionId, name, amount);

            const expense = await client.getExpense(expenseAccountPubkey);
            assert.equal(expense.name, name);
            assert.equal(expense.member.toString(), alice.publicKey.toString());
            assert.isAtLeast(expense.date.toNumber(), timestampBefore);
            assert.isAtMost(expense.date.toNumber(), Math.floor(Date.now() / 1000));

            const { expenseAdded } = events;
            assert.equal(expenseAdded.sessionId.toNumber(), sessionId);
            assert.equal(expenseAdded.expenseId, expectedExpenseId);
        });
    });
});
