import { atom } from 'recoil';
import { Expense, MemberBalance, MemberTransfer, Refund, Session, SessionMember } from '@solidr';

type SessionListState = { items: Session[]; loaded: boolean };

export const sessionListState = atom<SessionListState>({
    key: 'sessionListState',
    default: { items: [], loaded: false },
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
    isAdmin: boolean;
};

export const sessionCurrentState = atom<SessionCurrentState>({
    key: 'sessionCurrentState',
    default: {
        session: undefined,
        members: {},
        expenses: [],
        refunds: [],
        balances: {},
        transfers: [],
        myTotalCost: 0,
        totalExpenses: 0,
        isAdmin: false,
    },
    dangerouslyAllowMutability: true,
});
