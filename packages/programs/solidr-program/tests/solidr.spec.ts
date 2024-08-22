import * as _ from 'lodash';
import * as anchor from '@coral-xyz/anchor';
import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { assert } from 'chai';

import { MemberBalance, MISSING_INVITATION_HASH, SessionMember, SessionStatus, Solidr, SolidrClient } from '../client';
import { ACCOUNT_NOT_FOUND, ACCOUNT_NOT_FOUND as ACCOUNT_NOT_FOUND_ERROR, ACCOUNT_NOT_INITIALIZED, assertError } from './test.helpers';
import { hashToken } from '../client/TokenHelpers';
import { PublicKey } from '@solana/web3.js';

describe('solidr', () => {
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    const program = anchor.workspace.solidr as Program<Solidr>;

    const administrator = provider.wallet as anchor.Wallet;

    const alice = new Wallet(anchor.web3.Keypair.generate());
    const bob = new Wallet(anchor.web3.Keypair.generate());
    const charlie = new Wallet(anchor.web3.Keypair.generate());
    const paul = new Wallet(anchor.web3.Keypair.generate());
    // keep zoe for listing tests
    const zoe = new Wallet(anchor.web3.Keypair.generate());

    console.log('Alice:', alice.publicKey.toString());
    console.log('Bob:', bob.publicKey.toString());
    console.log('Charlie:', charlie.publicKey.toString());
    console.log('Paul:', paul.publicKey.toString());
    console.log('Zoe:', zoe.publicKey.toString());

    const client = new SolidrClient(program, { skipPreflight: false, preflightCommitment: 'confirmed' });

    before(async () => {
        await client.initGlobal(administrator);
        await client.airdrop(alice.publicKey, 100);
        await client.airdrop(bob.publicKey, 100);
        await client.airdrop(charlie.publicKey, 100);
        await client.airdrop(paul.publicKey, 100);
        await client.airdrop(zoe.publicKey, 100);
    });

    it('> should set session counter to zero', async () => {
        const globalPubkey = await client.findGlobalAccountAddress();
        const globalAccount = await client.getGlobalAccount(globalPubkey);
        assert.equal(globalAccount.sessionCount.toNumber(), 0);
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
            assert.equal(session.invitationHash, MISSING_INVITATION_HASH);

            const member = await client.getSessionMember(memberAccountAddress);
            assert.equal(member.name, 'Admin');
            assert.equal(member.addr.toString(), administrator.publicKey.toString());
            assert.isTrue(member.isAdmin);

            const { sessionOpened } = events;
            assert.equal(sessionOpened[0].sessionId.toNumber(), expectedSessionId);
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
            assert.equal(sessionOpened[0].sessionId.toNumber(), expectedSessionId);
        });

        it('> should fail when called with too long name', async () => {
            const longName = _.times(21, () => 'X').join('');
            await assertError(async () => client.openSession(alice, longName, '', 'Alice'), {
                code: 'SessionNameTooLong',
                message: `Session's name can't exceed 20 characters`,
            });
        });

        it('> should fail when called with too long description', async () => {
            const longDescription = _.times(81, () => 'X').join('');
            await assertError(async () => client.openSession(alice, 'name', longDescription, 'Alice'), {
                code: 'SessionDescriptionTooLong',
                message: `Session's description can't exceed 80 characters`,
            });
        });
    });

    describe('> updateSession', () => {
        it('> should update session info when called by admin', async () => {
            // setup
            const {
                events: { sessionOpened },
                accounts: { sessionAccountPubkey },
            } = await client.openSession(administrator, 'Session C', 'desc', 'Admin');
            const sid = sessionOpened[0].sessionId;

            const updatedSessionName = 'New Session C';
            const updatedSessionDesc = 'New desc';
            const {
                events: { sessionUpdated },
            } = await client.updateSession(administrator, sid, updatedSessionName, updatedSessionDesc);

            let session = await client.getSession(sessionAccountPubkey);
            assert.deepEqual(session.status, SessionStatus.Opened);
            assert.equal(session.name, updatedSessionName);
            assert.equal(session.description, updatedSessionDesc);
            // assert
            assert.equal(sessionUpdated[0].sessionId.toNumber(), sid);
        });
        it('> should failed when called with on close session', async () => {
            const {
                events: { sessionOpened },
            } = await client.openSession(administrator, 'name', 'description', 'Admin');
            const sessionId = sessionOpened[0].sessionId;
            await client.closeSession(administrator, sessionId);
            await assertError(async () => client.updateSession(administrator, sessionId, 'new name', 'new description'), {
                code: 'SessionClosed',
                message: 'Session is closed',
            });
        });
        it('> should failed when called by non admin', async () => {
            const {
                events: { sessionOpened },
            } = await client.openSession(administrator, 'name', 'description', 'Admin');
            const sessionId = sessionOpened[0].sessionId;
            await assertError(async () => client.updateSession(alice, sessionId, 'new name', 'new description'), {
                code: 'ForbiddenAsNonAdmin',
                message: 'Only session administrator is granted',
            });
        });
    });

    describe('> closeSession', () => {
        it('> should change session status and reset invitationHash', async () => {
            const name = 'Session C';
            const description = 'New session C';
            // setup
            const {
                events: openEvents,
                accounts: { sessionAccountPubkey },
            } = await client.openSession(administrator, name, description, 'Admin');
            const sid = openEvents.sessionOpened[0].sessionId;
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
            assert.equal(closeEvents.sessionClosed[0].sessionId.toNumber(), sid);
        });
    });

    describe('> deleteSession', () => {
        it('> should failed when called with on open session', async () => {
            const {
                events: { sessionOpened },
            } = await client.openSession(administrator, 'name', 'description', 'Admin');
            const sessionId = sessionOpened[0].sessionId;
            await assertError(async () => client.deleteSession(administrator, sessionId), {
                code: 'SessionNotClosed',
                message: 'Session is not closed',
            });
        });
        it('> should failed when called by non admin', async () => {
            const {
                events: { sessionOpened },
            } = await client.openSession(administrator, 'name', 'description', 'Admin');
            const sessionId = sessionOpened[0].sessionId;
            await client.closeSession(administrator, sessionId);
            await assertError(async () => client.deleteSession(bob, sessionId), {
                code: 'ForbiddenAsNonAdmin',
                message: 'Only session administrator is granted',
            });
        });
        it('> should succeed when called with admin on closed session', async () => {
            const {
                events: { sessionOpened },
                accounts: { sessionAccountPubkey },
            } = await client.openSession(administrator, 'name', 'description', 'Admin');
            const sessionId = sessionOpened[0].sessionId;

            const {
                accounts: { memberAccountPubkey: aliceAccountPubkey },
            } = await client.addSessionMember(administrator, sessionId, alice.publicKey, 'alice');
            const {
                accounts: { memberAccountPubkey: bobAccountPubkey },
            } = await client.addSessionMember(administrator, sessionId, bob.publicKey, 'bob');
            const {
                accounts: { memberAccountPubkey: charlieAccountPubkey },
            } = await client.addSessionMember(administrator, sessionId, charlie.publicKey, 'charlie');

            const {
                accounts: { refundAccountPubkey },
            } = await client.sendRefunds(bob, sessionId, [{ amount: 50, to: alice.publicKey }]);

            const {
                accounts: { expenseAccountPubkey: exp1AccountPubkey },
            } = await client.addExpense(alice, sessionId, 'exp1', 100, [bob.publicKey, charlie.publicKey]);
            const {
                accounts: { expenseAccountPubkey: exp2AccountPubkey },
            } = await client.addExpense(alice, sessionId, 'exp2', 60, [bob.publicKey, charlie.publicKey]);

            await client.closeSession(administrator, sessionId);

            assert.isDefined(await client.getSession(sessionAccountPubkey));

            const {
                events: { sessionDeleted },
            } = await client.deleteSession(administrator, sessionId);

            assert.equal(sessionDeleted[0].sessionId.toNumber(), sessionId);

            assert.isUndefined(await client.getSession(sessionAccountPubkey));

            await assertError(async () => client.getExpense(exp1AccountPubkey), {
                message: ACCOUNT_NOT_FOUND,
            });
            await assertError(async () => client.getExpense(exp2AccountPubkey), {
                message: ACCOUNT_NOT_FOUND,
            });
            await assertError(async () => client.getRefund(refundAccountPubkey), {
                message: ACCOUNT_NOT_FOUND,
            });
            await assertError(async () => client.getSessionMember(aliceAccountPubkey), {
                message: ACCOUNT_NOT_FOUND,
            });
            await assertError(async () => client.getSessionMember(bobAccountPubkey), {
                message: ACCOUNT_NOT_FOUND,
            });
            await assertError(async () => client.getSessionMember(charlieAccountPubkey), {
                message: ACCOUNT_NOT_FOUND,
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

        describe('> add session member', () => {
            it('> should create member pda', async () => {
                const {
                    accounts: { memberAccountPubkey },
                    events: { memberAdded },
                } = await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');

                const member = await client.getSessionMember(memberAccountPubkey);
                assert.equal(member.name, 'Bob');
                assert.equal(member.addr.toString(), bob.publicKey.toString());
                assert.isFalse(member.isAdmin);

                assert.equal(memberAdded[0].sessionId.toNumber(), sessionId.toNumber());
                assert.equal(memberAdded[0].name, 'Bob');
                assert.equal(memberAdded[0].addr.toString(), bob.publicKey.toString());
            });

            it('> should fail when called non session administrator', async () => {
                await assertError(async () => client.addSessionMember(bob, sessionId, bob.publicKey, 'Bob'), {
                    code: 'ForbiddenAsNonAdmin',
                    message: `Only session administrator is granted`,
                });
            });

            it('> should fail when called for already registered member', async () => {
                await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');

                await assertError(async () => client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob'), {
                    code: 'MemberAlreadyExists',
                    message: `Member already exists`,
                });
            });
        });

        describe('> update session member', () => {
            it('> should update member account when called by admin', async () => {
                const {
                    accounts: { memberAccountPubkey },
                } = await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');

                const updatedName = 'Bobby';
                const {
                    events: { memberUpdated },
                } = await client.updateSessionMember(alice, sessionId, bob.publicKey, updatedName);

                const member = await client.getSessionMember(memberAccountPubkey);
                assert.equal(member.name, updatedName);
                assert.equal(member.addr.toString(), bob.publicKey.toString());
                assert.isFalse(member.isAdmin);

                assert.equal(memberUpdated[0].sessionId.toNumber(), sessionId.toNumber());
                assert.equal(memberUpdated[0].name, updatedName);
                assert.equal(memberUpdated[0].addr.toString(), bob.publicKey.toString());
            });

            it('> should update member account when called by owner', async () => {
                const {
                    accounts: { memberAccountPubkey },
                } = await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');

                const updatedName = 'Bobby';
                const {
                    events: { memberUpdated },
                } = await client.updateSessionMember(bob, sessionId, bob.publicKey, updatedName);

                const member = await client.getSessionMember(memberAccountPubkey);
                assert.equal(member.name, updatedName);
                assert.equal(member.addr.toString(), bob.publicKey.toString());
                assert.isFalse(member.isAdmin);

                assert.equal(memberUpdated[0].sessionId.toNumber(), sessionId.toNumber());
                assert.equal(memberUpdated[0].name, updatedName);
                assert.equal(memberUpdated[0].addr.toString(), bob.publicKey.toString());
            });

            it('> should fail when called with non session owner and non admin', async () => {
                await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');
                await assertError(async () => client.updateSessionMember(charlie, sessionId, bob.publicKey, 'Bobby'), {
                    code: 'ForbiddenAsNonOwner',
                    message: `Only owner can update his informations`,
                });
            });
            it('> should failed when called with on close session', async () => {
                await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');
                await client.closeSession(alice, sessionId);
                await assertError(async () => client.updateSessionMember(alice, sessionId, bob.publicKey, 'Bobby'), {
                    code: 'SessionClosed',
                    message: 'Session is closed',
                });
            });
        });

        describe('> delete session member', () => {
            it('> should failed when called with on open session', async () => {
                await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');

                await assertError(async () => client.deleteSessionMember(alice, sessionId, bob.publicKey), {
                    code: 'SessionNotClosed',
                    message: 'Session is not closed',
                });
            });
            it('> should failed when called by non admin', async () => {
                await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');
                await client.closeSession(alice, sessionId);
                await assertError(async () => client.deleteSessionMember(bob, sessionId, bob.publicKey), {
                    code: 'ForbiddenAsNonAdmin',
                    message: 'Only session administrator is granted',
                });
            });
            it('> should close member pda', async () => {
                const {
                    accounts: { memberAccountPubkey },
                } = await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');

                await client.closeSession(alice, sessionId);
                await client.deleteSessionMember(alice, sessionId, bob.publicKey);
                await assertError(async () => client.getSessionMember(memberAccountPubkey), {
                    message: ACCOUNT_NOT_FOUND,
                });
            });
        });

        describe('> create invitation link', () => {
            it('> should fail with invalid sessionId', async () => {
                await assertError(async () => client.generateSessionLink(alice, new BN(100)), {
                    code: 'AccountNotInitialized',
                    message: `The program expected this account to be already initialized`,
                });
            });

            it('> should fail when called with non administrator', async () => {
                await assertError(async () => client.generateSessionLink(bob, sessionId), {
                    code: 'ForbiddenAsNonAdmin',
                    message: `Only session administrator is granted`,
                });
            });

            it('> should prevent anybody to join session without generated token', async () => {
                await assertError(async () => client.joinSessionAsMember(bob, sessionId, 'Bob', 'bad_token'), {
                    code: 'MissingInvitationHash',
                    message: `Missing invitation link hash`,
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
                    code: 'InvalidInvitationHash',
                    message: `Invalid invitation link hash`,
                });
            });
        });

        context('> two session members are registered', () => {
            beforeEach(async () => {
                await client.addSessionMember(alice, sessionId, bob.publicKey, 'bob');
                await client.addSessionMember(alice, sessionId, charlie.publicKey, 'charlie');
            });

            describe('> addExpense', () => {
                it('> should fail when called with invalid session id', async () => {
                    const invalidSessionId = new BN(666);
                    await assertError(async () => client.addExpense(alice, invalidSessionId, 'name', 10), {
                        message: ACCOUNT_NOT_FOUND_ERROR,
                    });
                });

                it('> should fail when called with amount equals to 0', async () => {
                    await assertError(async () => client.addExpense(alice, sessionId, 'name', 0), {
                        code: 'ExpenseAmountMustBeGreaterThanZero',
                        message: `Expense amount must be greater than zero`,
                    });
                });

                it('> should fail when called with to long name', async () => {
                    const longName = _.times(21, () => 'X').join('');
                    await assertError(async () => client.addExpense(alice, sessionId, longName, 10), {
                        code: 'ExpenseNameTooLong',
                        message: `Expense's name can't exceed 20 characters`,
                    });
                });

                it('> should failed when called by a non member', async () => {
                    await assertError(async () => client.addExpense(paul, sessionId, 'Paul', 10), {
                        code: 'AccountNotInitialized',
                        message: `The program expected this account to be already initialized`,
                    });
                });

                it('> should succeed when called by alice ', async () => {
                    const expectedExpenseId = 0;
                    const name = 'expense1';
                    const amount = 10.3;
                    const timestampBefore = Math.floor(Date.now()) - 10000; // sometimes, this timestamp is bigger than that set in expense !?

                    const {
                        events,
                        accounts: { expenseAccountPubkey },
                    } = await client.addExpense(alice, sessionId, name, amount);

                    const expense = await client.getExpense(expenseAccountPubkey);
                    assert.equal(expense.name, name);
                    assert.equal(expense.amount, amount);
                    assert.equal(expense.owner.toString(), alice.publicKey.toString());
                    assert.isAtLeast(expense.date.getTime(), timestampBefore);
                    assert.isAtMost(expense.date.getTime(), Math.floor(Date.now()));
                    assert.lengthOf(expense.participants, 1);
                    assert.equal(expense.participants[0].toString(), alice.publicKey.toString());

                    const { expenseAdded } = events;
                    assert.equal(expenseAdded[0].sessionId.toNumber(), sessionId);
                    assert.equal(expenseAdded[0].expenseId, expectedExpenseId);
                });

                it('> should succeed when called by a member', async () => {
                    const expectedExpenseId = 0;
                    const name = 'expense1';
                    const amount = 10.45;
                    const timestampBefore = Math.floor(Date.now()) - 10000;

                    const {
                        events,
                        accounts: { expenseAccountPubkey },
                    } = await client.addExpense(bob, sessionId, name, amount);

                    const expense = await client.getExpense(expenseAccountPubkey);
                    assert.equal(expense.name, name);
                    assert.equal(expense.amount, amount);
                    assert.equal(expense.owner.toString(), bob.publicKey.toString());
                    assert.isAtLeast(expense.date.getTime(), timestampBefore);
                    assert.isAtMost(expense.date.getTime(), Math.floor(Date.now()));
                    assert.lengthOf(expense.participants, 1);
                    assert.equal(expense.participants[0].toString(), bob.publicKey.toString());

                    const { expenseAdded } = events;
                    assert.equal(expenseAdded[0].sessionId.toNumber(), sessionId);
                    assert.equal(expenseAdded[0].expenseId, expectedExpenseId);
                });

                describe('> add expense with participants', () => {
                    const name = 'expense1';
                    const amount = 10;

                    it('> should fail when called with invalid session id', async () => {
                        await assertError(async () => client.addExpense(alice, new BN(666), name, amount, [bob.publicKey]), {
                            message: ACCOUNT_NOT_FOUND,
                        });
                    });

                    it('> should succeed with one member', async () => {
                        const {
                            accounts: { expenseAccountPubkey },
                            events: { expenseParticipantAdded },
                        } = await client.addExpense(alice, sessionId, name, amount, [bob.publicKey]);

                        const expense = await client.getExpense(expenseAccountPubkey);
                        assert.lengthOf(expense.participants, 2);
                        assert.equal(expense.participants[0].toString(), alice.publicKey.toString());
                        assert.equal(expense.participants[1].toString(), bob.publicKey.toString());

                        assert.equal(expenseParticipantAdded[0].expenseId, 0);
                        assert.equal(expenseParticipantAdded[0].memberPubkey.toString(), bob.publicKey.toString());
                    });

                    it('> should succeed with two members', async () => {
                        const {
                            accounts: { expenseAccountPubkey },
                            events: { expenseParticipantAdded },
                        } = await client.addExpense(alice, sessionId, name, amount, [bob.publicKey, charlie.publicKey]);

                        const expense = await client.getExpense(expenseAccountPubkey);
                        assert.lengthOf(expense.participants, 3);
                        assert.equal(expense.participants[0].toString(), alice.publicKey.toString());
                        assert.equal(expense.participants[1].toString(), bob.publicKey.toString());
                        assert.equal(expense.participants[2].toString(), charlie.publicKey.toString());

                        assert.equal(expenseParticipantAdded[0].expenseId, 0);
                        assert.equal(expenseParticipantAdded[0].memberPubkey.toString(), bob.publicKey.toString());
                        assert.equal(expenseParticipantAdded[1].expenseId, 0);
                        assert.equal(expenseParticipantAdded[1].memberPubkey.toString(), charlie.publicKey.toString());
                    });

                    it('> should succeed but not add non session member', async () => {
                        const {
                            accounts: { expenseAccountPubkey },
                            events: { expenseParticipantAdded },
                        } = await client.addExpense(alice, sessionId, name, amount, [paul.publicKey]);

                        const expense = await client.getExpense(expenseAccountPubkey);
                        assert.lengthOf(expense.participants, 1);
                        assert.equal(expense.participants[0].toString(), alice.publicKey.toString());

                        assert.isUndefined(expenseParticipantAdded);
                    });
                });
            });

            describe('> updateExpense', () => {
                let currentExpenseId: BN;
                let currentExpenseAccountPubkey: PublicKey;

                beforeEach(async () => {
                    const {
                        accounts: { expenseAccountPubkey },
                        events: { expenseAdded },
                    } = await client.addExpense(alice, sessionId, 'exp 3', 200, [charlie.publicKey]);
                    currentExpenseId = new BN(expenseAdded[0].expenseId);
                    currentExpenseAccountPubkey = expenseAccountPubkey;
                });

                it("> should update expense when I'm the owner", async () => {
                    const updatedName = 'exp 3 updated';
                    const updatedAmount = 100.37;
                    const {
                        events: { expenseUpdated },
                    } = await client.updateExpense(alice, sessionId, currentExpenseId, updatedName, updatedAmount, [bob.publicKey]);
                    const expense = await client.getExpense(currentExpenseAccountPubkey);

                    assert.equal(expense.name, updatedName);
                    assert.equal(expense.amount, updatedAmount);
                    assert.lengthOf(expense.participants, 2);
                    assert.sameDeepMembers(expense.participants, [alice.publicKey, bob.publicKey]);

                    assert.equal(expenseUpdated[0].sessionId.toNumber(), sessionId);
                    assert.equal(expenseUpdated[0].expenseId, currentExpenseId);
                });

                it('> should fail when called with non owner of expense', async () => {
                    await assertError(async () => client.updateExpense(bob, sessionId, currentExpenseId, 'exp 3 updated', 100, [bob.publicKey]), {
                        code: 'NotExpenseOwner',
                        message: 'Only expense owner can update or delete expense',
                    });
                });

                it('> should fail when called with invalid session id', async () => {
                    await assertError(async () => client.updateExpense(alice, new BN(666), currentExpenseId, 'exp 3 updated', 100, [bob.publicKey]), {
                        message: ACCOUNT_NOT_FOUND,
                    });
                });
            });

            describe('> deleteExpense', () => {
                let currentExpenseId: BN;
                let currentExpenseAccountPubkey: PublicKey;

                beforeEach(async () => {
                    const {
                        accounts: { expenseAccountPubkey },
                        events: { expenseAdded },
                    } = await client.addExpense(alice, sessionId, 'exp 3', 200, [charlie.publicKey]);
                    currentExpenseId = new BN(expenseAdded[0].expenseId);
                    currentExpenseAccountPubkey = expenseAccountPubkey;
                });

                it("> should delete expense when I'm the owner", async () => {
                    const {
                        events: { expenseDeleted },
                    } = await client.deleteExpense(alice, sessionId, currentExpenseId);

                    await assertError(async () => client.getExpense(currentExpenseAccountPubkey), {
                        message: ACCOUNT_NOT_FOUND,
                    });

                    assert.equal(expenseDeleted[0].sessionId.toNumber(), sessionId);
                    assert.equal(expenseDeleted[0].expenseId, currentExpenseId);
                });

                it('> should fail when called with non owner of expense', async () => {
                    await assertError(async () => client.deleteExpense(bob, sessionId, currentExpenseId), {
                        code: 'NotExpenseOwner',
                        message: 'Only expense owner can update or delete expense',
                    });
                });

                it('> should fail when called with invalid session id', async () => {
                    await assertError(async () => client.deleteExpense(alice, new BN(666), currentExpenseId), {
                        code: 'AccountNotInitialized',
                        message: 'The program expected this account to be already initialized',
                    });
                });
            });

            context('> an expense is created by alice. charlie and bob are members of the session', () => {
                let expenseId: BN;

                beforeEach(async () => {
                    const { events } = await client.addExpense(alice, sessionId, 'name', 20);
                    expenseId = new BN(events.expenseAdded[0].expenseId);
                });

                describe('> addExpenseParticipants', () => {
                    it('> should fail when called with invalid session id', async () => {
                        await assertError(async () => client.addExpenseParticipants(alice, new BN(666), expenseId, [bob.publicKey]), {
                            message: ACCOUNT_NOT_INITIALIZED,
                        });
                    });

                    it('> should fail when called with non expense owner', async () => {
                        await assertError(async () => client.addExpenseParticipants(bob, sessionId, expenseId, [charlie.publicKey]), {
                            code: 'NotExpenseOwner',
                            message: 'Only expense owner can update or delete expense',
                        });
                    });

                    it('> should succeed with one member', async () => {
                        const {
                            accounts: { expenseAccountPubkey },
                            events: { expenseParticipantAdded },
                        } = await client.addExpenseParticipants(alice, sessionId, expenseId, [bob.publicKey]);

                        const expense = await client.getExpense(expenseAccountPubkey);
                        assert.lengthOf(expense.participants, 2);
                        assert.equal(expense.participants[0].toString(), alice.publicKey.toString());
                        assert.equal(expense.participants[1].toString(), bob.publicKey.toString());

                        assert.equal(expenseParticipantAdded[0].expenseId, 0);
                        assert.equal(expenseParticipantAdded[0].memberPubkey.toString(), bob.publicKey.toString());
                    });

                    it('> should succeed with two members', async () => {
                        const {
                            accounts: { expenseAccountPubkey },
                            events: { expenseParticipantAdded },
                        } = await client.addExpenseParticipants(alice, sessionId, expenseId, [bob.publicKey, charlie.publicKey]);

                        const expense = await client.getExpense(expenseAccountPubkey);
                        assert.lengthOf(expense.participants, 3);
                        assert.equal(expense.participants[0].toString(), alice.publicKey.toString());
                        assert.equal(expense.participants[1].toString(), bob.publicKey.toString());
                        assert.equal(expense.participants[2].toString(), charlie.publicKey.toString());

                        assert.equal(expenseParticipantAdded[0].expenseId, 0);
                        assert.equal(expenseParticipantAdded[0].memberPubkey.toString(), bob.publicKey.toString());
                        assert.equal(expenseParticipantAdded[1].expenseId, 0);
                        assert.equal(expenseParticipantAdded[1].memberPubkey.toString(), charlie.publicKey.toString());
                    });

                    it('> should succeed but not add non session member', async () => {
                        const {
                            accounts: { expenseAccountPubkey },
                            events: { expenseParticipantAdded },
                        } = await client.addExpenseParticipants(alice, sessionId, expenseId, [paul.publicKey]);

                        const expense = await client.getExpense(expenseAccountPubkey);
                        assert.lengthOf(expense.participants, 1);
                        assert.equal(expense.participants[0].toString(), alice.publicKey.toString());

                        assert.isUndefined(expenseParticipantAdded);
                    });
                });

                context('> participants are added to the expense', () => {
                    beforeEach(async () => {
                        await client.addSessionMember(alice, sessionId, paul.publicKey, 'paul');
                        await client.addExpenseParticipants(alice, sessionId, expenseId, [bob.publicKey, charlie.publicKey, paul.publicKey]);
                    });

                    describe('> removeExpenseParticipants', () => {
                        it('> should fail when called with invalid session id', async () => {
                            await assertError(async () => client.removeExpenseParticipants(alice, new BN(666), expenseId, [bob.publicKey]), {
                                message: ACCOUNT_NOT_INITIALIZED,
                            });
                        });

                        it('> should fail when called with non expense owner', async () => {
                            await assertError(async () => client.removeExpenseParticipants(bob, sessionId, expenseId, [charlie.publicKey]), {
                                code: 'NotExpenseOwner',
                                message: 'Only expense owner can update or delete expense',
                            });
                        });

                        it('> should fail when called to remove expense owner', async () => {
                            await assertError(async () => client.removeExpenseParticipants(alice, sessionId, expenseId, [alice.publicKey]), {
                                code: 'CannotRemoveExpenseOwner',
                                message: 'Expense owner cannot be removed from participants',
                            });
                        });

                        it('> should succeed with one member', async () => {
                            const {
                                accounts: { expenseAccountPubkey },
                                events: { expenseParticipantRemoved },
                            } = await client.removeExpenseParticipants(alice, sessionId, expenseId, [charlie.publicKey]);

                            const expense = await client.getExpense(expenseAccountPubkey);
                            assert.lengthOf(expense.participants, 3);
                            assert.equal(expense.participants[0].toString(), alice.publicKey.toString());
                            assert.equal(expense.participants[1].toString(), bob.publicKey.toString());
                            assert.equal(expense.participants[2].toString(), paul.publicKey.toString());

                            assert.equal(expenseParticipantRemoved[0].expenseId, 0);
                            assert.equal(expenseParticipantRemoved[0].memberPubkey.toString(), charlie.publicKey.toString());
                        });

                        it('> should succeed with two members', async () => {
                            const {
                                accounts: { expenseAccountPubkey },
                                events: { expenseParticipantRemoved },
                            } = await client.removeExpenseParticipants(alice, sessionId, expenseId, [bob.publicKey, charlie.publicKey]);

                            const expense = await client.getExpense(expenseAccountPubkey);
                            assert.lengthOf(expense.participants, 2);
                            assert.equal(expense.participants[0].toString(), alice.publicKey.toString());
                            assert.equal(expense.participants[1].toString(), paul.publicKey.toString());

                            assert.equal(expenseParticipantRemoved[0].expenseId, 0);
                            assert.equal(expenseParticipantRemoved[0].memberPubkey.toString(), bob.publicKey.toString());
                            assert.equal(expenseParticipantRemoved[1].expenseId, 0);
                            assert.equal(expenseParticipantRemoved[1].memberPubkey.toString(), charlie.publicKey.toString());
                        });
                    });
                });
            });

            describe('> sendRefunds', () => {
                it('> should fail when called with invalid session id', async () => {
                    const invalidSessionId = new BN(666);
                    await assertError(
                        async () =>
                            client.sendRefunds(alice, invalidSessionId, [
                                {
                                    amount: 10,
                                    to: bob.publicKey,
                                },
                            ]),
                        {
                            message: ACCOUNT_NOT_FOUND_ERROR,
                        },
                    );
                });

                it('> should fail when called with amount equals to 0', async () => {
                    await assertError(
                        async () =>
                            client.sendRefunds(alice, sessionId, [
                                {
                                    amount: 0,
                                    to: bob.publicKey,
                                },
                            ]),
                        {
                            code: 'RefundAmountMustBeGreaterThanZero',
                            message: `Refund amount must be greater than zero`,
                        },
                    );
                });

                it('> should failed when called by a non member', async () => {
                    await assertError(
                        async () =>
                            client.sendRefunds(paul, sessionId, [
                                {
                                    amount: 10,
                                    to: bob.publicKey,
                                },
                            ]),
                        {
                            code: 'AccountNotInitialized',
                            message: `The program expected this account to be already initialized`,
                        },
                    );
                });

                it('> should failed when receiver is not a member', async () => {
                    await assertError(
                        async () =>
                            client.sendRefunds(alice, sessionId, [
                                {
                                    amount: 10,
                                    to: paul.publicKey,
                                },
                            ]),
                        {
                            code: 'AccountNotInitialized',
                            message: `The program expected this account to be already initialized`,
                        },
                    );
                });

                it('> should succeed when called by session administrator ', async () => {
                    const expectedRefundId = 0;
                    const timestampBefore = Math.floor(Date.now()) - 10000; // sometimes, this timestamp is bigger than that set in expense !?
                    const senderBalanceBefore = await provider.connection.getBalance(alice.publicKey);
                    const receiverBalanceBefore = await provider.connection.getBalance(bob.publicKey);

                    const {
                        fees,
                        events,
                        accounts: { refundAccountPubkey },
                    } = await client.sendRefunds(alice, sessionId, [{ amount: 10.2, to: bob.publicKey }]);

                    const refund = await client.getRefund(refundAccountPubkey);
                    const transferedLamports = refund.amountInLamports.toNumber();

                    assert.equal(refund.sessionId.toString(), sessionId.toString());
                    assert.equal(refund.from.toString(), alice.publicKey.toString());
                    assert.equal(refund.to.toString(), bob.publicKey.toString());
                    assert.isAtLeast(refund.date.getTime(), timestampBefore);
                    assert.isAtMost(refund.date.getTime(), Math.floor(Date.now()));
                    assert.equal(refund.amount.toPrecision(4), '10.20');
                    assert.isAtLeast(transferedLamports, 1);

                    const { refundAdded } = events;
                    assert.equal(refundAdded[0].sessionId.toNumber(), sessionId);
                    assert.equal(refundAdded[0].refundId, expectedRefundId);

                    const senderBalanceAfter = await provider.connection.getBalance(alice.publicKey);
                    const receiverBalanceAfter = await provider.connection.getBalance(bob.publicKey);
                    const refundAccountBalance = await provider.connection.getBalance(refundAccountPubkey);

                    assert.equal(receiverBalanceAfter, receiverBalanceBefore + transferedLamports);
                    assert.equal(senderBalanceAfter, senderBalanceBefore - fees - refundAccountBalance - transferedLamports);
                });

                it('> should succeed when called by a member', async () => {
                    const expectedRefundId = 0;
                    const timestampBefore = Math.floor(Date.now()) - 10000; // sometimes, this timestamp is bigger than that set in expense !?
                    const senderBalanceBefore = await provider.connection.getBalance(bob.publicKey);
                    const receiverBalanceBefore = await provider.connection.getBalance(charlie.publicKey);

                    const {
                        fees,
                        events,
                        accounts: { refundAccountPubkey },
                    } = await client.sendRefunds(bob, sessionId, [{ amount: 10.8, to: charlie.publicKey }]);

                    const refund = await client.getRefund(refundAccountPubkey);
                    const transferedLamports = refund.amountInLamports.toNumber();

                    assert.equal(refund.sessionId.toString(), sessionId.toString());
                    assert.equal(refund.from.toString(), bob.publicKey.toString());
                    assert.equal(refund.to.toString(), charlie.publicKey.toString());
                    assert.isAtLeast(refund.date.getTime(), timestampBefore);
                    assert.isAtMost(refund.date.getTime(), Math.floor(Date.now()));
                    assert.equal(refund.amount.toPrecision(4), '10.80');
                    assert.isAtLeast(transferedLamports, 1);

                    const { refundAdded } = events;
                    assert.equal(refundAdded[0].sessionId.toNumber(), sessionId);
                    assert.equal(refundAdded[0].refundId, expectedRefundId);

                    const senderBalanceAfter = await provider.connection.getBalance(bob.publicKey);
                    const receiverBalanceAfter = await provider.connection.getBalance(charlie.publicKey);
                    const refundAccountBalance = await provider.connection.getBalance(refundAccountPubkey);

                    assert.equal(receiverBalanceAfter, receiverBalanceBefore + transferedLamports);
                    assert.equal(senderBalanceAfter, senderBalanceBefore - fees - refundAccountBalance - transferedLamports);
                });
            });

            describe('> delete Refund', () => {
                it('> should failed when called with on open session', async () => {
                    const {
                        events: { refundAdded },
                    } = await client.sendRefunds(alice, sessionId, [{ amount: 20, to: bob.publicKey }]);

                    await assertError(async () => client.deleteRefund(alice, sessionId, new BN(refundAdded[0].refundId)), {
                        code: 'SessionNotClosed',
                        message: 'Session is not closed',
                    });
                });
                it('> should failed when called by non admin', async () => {
                    await client.sendRefunds(alice, sessionId, [{ amount: 20, to: bob.publicKey }]);
                    await client.closeSession(alice, sessionId);
                    await assertError(async () => client.deleteSessionMember(bob, sessionId, bob.publicKey), {
                        code: 'ForbiddenAsNonAdmin',
                        message: 'Only session administrator is granted',
                    });
                });
                it('> should close refund pda', async () => {
                    const {
                        accounts: { refundAccountPubkey },
                    } = await client.sendRefunds(alice, sessionId, [{ amount: 20, to: bob.publicKey }]);

                    await client.closeSession(alice, sessionId);
                    await client.deleteSession(alice, sessionId);
                    await assertError(async () => client.getRefund(refundAccountPubkey), {
                        message: ACCOUNT_NOT_FOUND,
                    });
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
                        code: 'SessionClosed',
                        message: `Session is closed`,
                    });
                });
            });

            describe('> create invitation link', () => {
                it('> should fail because session is closed', async () => {
                    await assertError(async () => client.generateSessionLink(alice, sessionId), {
                        code: 'SessionClosed',
                        message: `Session is closed`,
                    });
                });
            });

            describe('> close session', () => {
                it('> should fail because session is closed', async () => {
                    await assertError(async () => client.closeSession(alice, sessionId), {
                        code: 'SessionClosed',
                        message: `Session is closed`,
                    });
                });
            });

            describe('> add expense', () => {
                it('> should fail when called with to long name', async () => {
                    await assertError(async () => client.addExpense(alice, sessionId, 'New expense', 10), {
                        code: 'SessionClosed',
                        message: `Session is closed`,
                    });
                });
            });
        });
    });

    describe('> listUserSessions', () => {
        it('> should return empty page', async () => {
            const page = await client.listUserSessions(zoe.publicKey);
            assert.isEmpty(page);
        });

        it('> should return owned and joined sessions with pagination', async () => {
            // Alice create other session
            const r1 = await client.openSession(alice, 'A', 'Alice session', 'Alice');
            const s1 = new BN(r1.events.sessionOpened[0].sessionId);
            // Zoe join alice's session
            await client.addSessionMember(alice, s1, zoe.publicKey, 'Zoééé');

            // Zoe create multiple owned session
            const zoeSessionIds: BN[] = [];
            for (let i = 1; i <= 5; i++) {
                const r = await client.openSession(zoe, `Z${i}`, `Zoe session ${i}`, 'Zoe');
                zoeSessionIds.push(new BN(r.events.sessionOpened[0].sessionId));
            }

            const page1 = await client.listUserSessions(zoe.publicKey, { page: 1, perPage: 5 });
            assert.sameDeepMembers(page1, [
                {
                    sessionId: s1,
                    name: 'A',
                    description: 'Alice session',
                    admin: alice.publicKey,
                    expensesCount: 0,
                    refundsCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
                {
                    sessionId: zoeSessionIds[0],
                    name: 'Z1',
                    description: `Zoe session 1`,
                    admin: zoe.publicKey,
                    expensesCount: 0,
                    refundsCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
                {
                    sessionId: zoeSessionIds[1],
                    name: 'Z2',
                    description: `Zoe session 2`,
                    admin: zoe.publicKey,
                    expensesCount: 0,
                    refundsCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
                {
                    sessionId: zoeSessionIds[2],
                    name: 'Z3',
                    description: `Zoe session 3`,
                    admin: zoe.publicKey,
                    expensesCount: 0,
                    refundsCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
                {
                    sessionId: zoeSessionIds[3],
                    name: 'Z4',
                    description: `Zoe session 4`,
                    admin: zoe.publicKey,
                    expensesCount: 0,
                    refundsCount: 0,
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
                    refundsCount: 0,
                    status: SessionStatus.Opened,
                    invitationHash: MISSING_INVITATION_HASH,
                },
            ]);
        });

        describe('> listSessionMembers', () => {
            it('> should return page with only admin member', async () => {
                const r = await client.openSession(alice, 'A', 'Alice session', 'Alice');
                const sessionId = new BN(r.events.sessionOpened[0].sessionId);
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
                const sessionId = new BN(r.events.sessionOpened[0].sessionId);
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

    describe('> listSessionExpenses', () => {
        let sessionId: BN;

        beforeEach(async () => {
            // Alice create a session
            const r = await client.openSession(alice, 'A', 'Alice session', 'Alice');
            sessionId = new BN(r.events.sessionOpened[0].sessionId);
            // Add members
            await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');
            await client.addSessionMember(alice, sessionId, charlie.publicKey, 'Charlie');
            await client.addSessionMember(alice, sessionId, zoe.publicKey, 'Zoé');
        });

        it('> should return empty page', async () => {
            const page = await client.listSessionExpenses(sessionId);
            assert.isEmpty(page);
        });

        it('> should return correct number of expenses dependending on filter', async () => {
            await client.addExpense(alice, sessionId, 'exp 1', 100, [bob.publicKey, charlie.publicKey]);
            await client.addExpense(bob, sessionId, 'exp 2', 50, [alice.publicKey]);
            await client.addExpense(bob, sessionId, 'exp 3', 200);
            const pageWithAllExpenses = await client.listSessionExpenses(sessionId);
            assert.lengthOf(pageWithAllExpenses, 3);

            const pageWithPaginatedExpenses = await client.listSessionExpenses(sessionId, undefined, {
                page: 1,
                perPage: 2,
            });
            assert.lengthOf(pageWithPaginatedExpenses, 2);

            const pageWithAliceExpenses = await client.listSessionExpenses(sessionId, { owner: alice.publicKey });
            assert.lengthOf(pageWithAliceExpenses, 1);

            const pageWithBobExpenses = await client.listSessionExpenses(sessionId, { owner: bob.publicKey });
            assert.lengthOf(pageWithBobExpenses, 2);

            const pageWithCharlieExpenses = await client.listSessionExpenses(sessionId, { owner: charlie.publicKey });
            assert.lengthOf(pageWithCharlieExpenses, 0);
        });
    });

    describe('> listSessionRefunds', () => {
        let sessionId: BN;

        beforeEach(async () => {
            // Alice create a session
            const r = await client.openSession(alice, 'A', 'Alice session', 'Alice');
            sessionId = new BN(r.events.sessionOpened[0].sessionId);
            // Add members
            await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');
            await client.addSessionMember(alice, sessionId, charlie.publicKey, 'Charlie');
            await client.addSessionMember(alice, sessionId, zoe.publicKey, 'Zoé');
            await client.addExpense(alice, sessionId, 'exp 1', 100, [bob.publicKey, charlie.publicKey]);
            await client.addExpense(bob, sessionId, 'exp 2', 50, [alice.publicKey]);
            await client.addExpense(bob, sessionId, 'exp 3', 200);
        });

        it('> should return empty page', async () => {
            const page = await client.listSessionRefunds(sessionId);
            assert.isEmpty(page);
        });

        it('> should return correct number of expenses dependending on filter', async () => {
            await client.sendRefunds(charlie, sessionId, [
                { amount: 100, to: bob.publicKey },
                { amount: 50, to: alice.publicKey },
            ]);
            await client.sendRefunds(alice, sessionId, [{ amount: 50, to: bob.publicKey }]);
            const pageWithAllExpenses = await client.listSessionRefunds(sessionId);
            assert.lengthOf(pageWithAllExpenses, 3);

            const pageWithPaginatedExpenses = await client.listSessionRefunds(sessionId, undefined, {
                page: 1,
                perPage: 2,
            });
            assert.lengthOf(pageWithPaginatedExpenses, 2);

            const pageFromAliceExpenses = await client.listSessionRefunds(sessionId, { from: alice.publicKey });
            assert.lengthOf(pageFromAliceExpenses, 1);

            const pageFromBobExpenses = await client.listSessionRefunds(sessionId, { from: bob.publicKey });
            assert.lengthOf(pageFromBobExpenses, 0);

            const pageFromCharlieExpenses = await client.listSessionRefunds(sessionId, { from: charlie.publicKey });
            assert.lengthOf(pageFromCharlieExpenses, 2);

            const pageToAliceExpenses = await client.listSessionRefunds(sessionId, { to: alice.publicKey });
            assert.lengthOf(pageToAliceExpenses, 1);

            const pageToBobExpenses = await client.listSessionRefunds(sessionId, { to: bob.publicKey });
            assert.lengthOf(pageToBobExpenses, 2);

            const pageToCharlieExpenses = await client.listSessionRefunds(sessionId, { to: charlie.publicKey });
            assert.lengthOf(pageToCharlieExpenses, 0);
        });
    });

    describe('> calculateBalance', () => {
        let sessionId: BN;
        let sessionMembers: SessionMember[];

        beforeEach(async () => {
            // Alice create a session
            const r = await client.openSession(alice, 'A', 'Alice session', 'Alice');
            sessionId = new BN(r.events.sessionOpened[0].sessionId);
            // Add members
            await client.addSessionMember(alice, sessionId, bob.publicKey, 'Bob');
            await client.addSessionMember(alice, sessionId, charlie.publicKey, 'Charlie');
            await client.addSessionMember(alice, sessionId, zoe.publicKey, 'Zoé');

            sessionMembers = await client.listSessionMembers(sessionId);
        });

        const assertBalance = (members: { [key: string]: MemberBalance }, member: Wallet, value: any) => {
            assert.deepPropertyVal(members, member.publicKey.toString(), value);
        };

        it('> Should handle a simple case with three people', async () => {
            await client.addExpense(alice, sessionId, 'exp 1', 30, [bob.publicKey, charlie.publicKey]);
            await client.addExpense(bob, sessionId, 'exp 2', 20, [alice.publicKey, charlie.publicKey]);
            await client.addExpense(charlie, sessionId, 'exp 3', 10, [alice.publicKey, bob.publicKey]);
            const expenses = await client.listSessionExpenses(sessionId);
            const refunds = await client.listSessionRefunds(sessionId);
            const { totalExpenses, balances, transfers } = await client.computeBalance(sessionMembers, expenses, refunds);

            //balances
            assertBalance(balances, alice, { owner: alice.publicKey, balance: 10, totalCost: 20 });
            assertBalance(balances, bob, { owner: bob.publicKey, balance: 0, totalCost: 20 });
            assertBalance(balances, charlie, { owner: charlie.publicKey, balance: -10, totalCost: 20 });
            assertBalance(balances, zoe, { owner: zoe.publicKey, balance: 0, totalCost: 0 });
            assert.equal(totalExpenses, 60);
            //transfers
            assert.lengthOf(transfers, 1);
            assert.includeDeepMembers(transfers, [{ from: charlie.publicKey, to: alice.publicKey, amount: 10 }]);
        });

        it('> Should handle partial participation', async () => {
            await client.addExpense(alice, sessionId, 'exp 1', 90, [bob.publicKey, charlie.publicKey]);
            await client.addExpense(bob, sessionId, 'exp 2', 50, [alice.publicKey]);
            await client.addExpense(charlie, sessionId, 'exp 3', 200, [alice.publicKey]);
            const expenses = await client.listSessionExpenses(sessionId);
            const refunds = await client.listSessionRefunds(sessionId);
            const { totalExpenses, balances, transfers } = await client.computeBalance(sessionMembers, expenses, refunds);

            //balances
            assertBalance(balances, alice, { owner: alice.publicKey, balance: -65, totalCost: 155 });
            assertBalance(balances, bob, { owner: bob.publicKey, balance: -5, totalCost: 55 });
            assertBalance(balances, charlie, { owner: charlie.publicKey, balance: 70, totalCost: 130 });
            assertBalance(balances, zoe, { owner: zoe.publicKey, balance: 0, totalCost: 0 });
            assert.equal(totalExpenses, 340);
            //transfers
            assert.lengthOf(transfers, 2);
            assert.includeDeepMembers(transfers, [
                { from: bob.publicKey, to: charlie.publicKey, amount: 5 },
                { from: alice.publicKey, to: charlie.publicKey, amount: 65 },
            ]);
        });

        it('> Should handle advance refund', async () => {
            await client.addExpense(alice, sessionId, 'exp 1', 100, [bob.publicKey, charlie.publicKey]);
            await client.addExpense(bob, sessionId, 'exp 2', 60, [alice.publicKey]);
            await client.addExpense(charlie, sessionId, 'exp 3', 30, [alice.publicKey]);
            await client.sendRefunds(bob, sessionId, [{ amount: 20, to: alice.publicKey }]);
            const expenses = await client.listSessionExpenses(sessionId);
            const refunds = await client.listSessionRefunds(sessionId);
            const { totalExpenses, balances, transfers } = await client.computeBalance(sessionMembers, expenses, refunds);

            //balances
            assertBalance(balances, alice, { owner: alice.publicKey, balance: 1.67, totalCost: 78.33 });
            assertBalance(balances, bob, { owner: bob.publicKey, balance: 16.67, totalCost: 63.33 });
            assertBalance(balances, charlie, { owner: charlie.publicKey, balance: -18.33, totalCost: 48.33 });
            assertBalance(balances, zoe, { owner: zoe.publicKey, balance: 0, totalCost: 0 });
            assert.equal(totalExpenses, 190);
            //transfers
            assert.lengthOf(transfers, 2);
            assert.includeDeepMembers(transfers, [
                { from: charlie.publicKey, to: alice.publicKey, amount: 1.67 },
                { from: charlie.publicKey, to: bob.publicKey, amount: 16.66 },
            ]);
        });

        it('> Should handle when one person pays everything', async () => {
            await client.addExpense(alice, sessionId, 'exp 1', 100, [bob.publicKey, charlie.publicKey]);
            await client.addExpense(alice, sessionId, 'exp 2', 50, [bob.publicKey, charlie.publicKey]);
            await client.addExpense(alice, sessionId, 'exp 3', 30, [bob.publicKey, charlie.publicKey]);
            const expenses = await client.listSessionExpenses(sessionId);
            const refunds = await client.listSessionRefunds(sessionId);
            const { totalExpenses, balances, transfers } = await client.computeBalance(sessionMembers, expenses, refunds);

            //balances
            assertBalance(balances, alice, { owner: alice.publicKey, balance: 120, totalCost: 60 });
            assertBalance(balances, bob, { owner: bob.publicKey, balance: -60, totalCost: 60 });
            assertBalance(balances, charlie, { owner: charlie.publicKey, balance: -60, totalCost: 60 });
            assertBalance(balances, zoe, { owner: zoe.publicKey, balance: 0, totalCost: 0 });
            assert.equal(totalExpenses, 180);
            //transfers
            assert.lengthOf(transfers, 2);
            assert.includeDeepMembers(transfers, [
                { from: bob.publicKey, to: alice.publicKey, amount: 60 },
                { from: charlie.publicKey, to: alice.publicKey, amount: 60 },
            ]);
        });

        it('> Should handle fractional amounts', async () => {
            await client.addExpense(alice, sessionId, 'exp 1', 33.33, [bob.publicKey, charlie.publicKey]);
            await client.addExpense(bob, sessionId, 'exp 2', 66.67, [alice.publicKey, charlie.publicKey]);
            await client.addExpense(charlie, sessionId, 'exp 3', 100, [bob.publicKey, alice.publicKey]);
            const expenses = await client.listSessionExpenses(sessionId);
            const refunds = await client.listSessionRefunds(sessionId);
            const { totalExpenses, balances, transfers } = await client.computeBalance(sessionMembers, expenses, refunds);

            //balances
            assertBalance(balances, alice, { owner: alice.publicKey, balance: -33.34, totalCost: 66.67 });
            assertBalance(balances, bob, { owner: bob.publicKey, balance: 0, totalCost: 66.67 });
            assertBalance(balances, charlie, { owner: charlie.publicKey, balance: 33.33, totalCost: 66.67 });
            assertBalance(balances, zoe, { owner: zoe.publicKey, balance: 0, totalCost: 0 });
            assert.equal(totalExpenses, 200);
            //transfers
            assert.lengthOf(transfers, 1);
            assert.includeDeepMembers(transfers, [{ from: alice.publicKey, to: charlie.publicKey, amount: 33.33 }]);
        });

        it('> Should handle when no transfers are needed (already balanced)', async () => {
            await client.addExpense(alice, sessionId, 'exp 1', 30, [bob.publicKey, charlie.publicKey]);
            await client.addExpense(bob, sessionId, 'exp 2', 30, [alice.publicKey, charlie.publicKey]);
            await client.addExpense(charlie, sessionId, 'exp 3', 30, [bob.publicKey, alice.publicKey]);
            const expenses = await client.listSessionExpenses(sessionId);
            const refunds = await client.listSessionRefunds(sessionId);
            const { totalExpenses, balances, transfers } = await client.computeBalance(sessionMembers, expenses, refunds);

            //balances
            assertBalance(balances, alice, { owner: alice.publicKey, balance: 0, totalCost: 30 });
            assertBalance(balances, bob, { owner: bob.publicKey, balance: 0, totalCost: 30 });
            assertBalance(balances, charlie, { owner: charlie.publicKey, balance: 0, totalCost: 30 });
            assertBalance(balances, zoe, { owner: zoe.publicKey, balance: 0, totalCost: 0 });
            assert.equal(totalExpenses, 90);
            //transfers
            assert.lengthOf(transfers, 0);
        });
    });
});
