import { atom } from 'recoil';
import { Expense, MemberBalance, MemberTransfer, Refund, Session, SessionMember } from '@solidr';

type SessionListState = { items: Session[] };

export const sessionListState = atom<SessionListState>({
    key: 'sessionListState',
    default: { items: [] },
    dangerouslyAllowMutability: true,
});

export type SessionCurrentState = {
    session: Session | undefined;
    members: { [publicKey: string]: SessionMember };
    expenses: Expense[];
    refunds: Refund[];
    balances: { [publicKey: string]: MemberBalance };
    transfers: MemberTransfer[];
    myTotalCost: number;
    totalExpenses: number;
    totalRefunds: number;
    isAdmin: boolean;
};

export const defaultSessionState: SessionCurrentState = {
    session: undefined,
    members: {},
    expenses: [],
    refunds: [],
    balances: {},
    transfers: [],
    myTotalCost: 0,
    totalExpenses: 0,
    totalRefunds: 0,
    isAdmin: false,
};

export const sessionCurrentState = atom<SessionCurrentState>({
    key: 'sessionCurrentState',
    default: defaultSessionState,
    dangerouslyAllowMutability: true,
});
