import { atom } from 'recoil';
import { SessionMember, Session, Expense } from '@solidr';

type SessionListState = { items: Session[]; loaded: boolean };

export const sessionListState = atom<SessionListState>({
	key: 'sessionListState',
	default: { items: [], loaded: false },
});

export type SessionCurrentState = {
	session: Session;
	members: { [publicKey: string]: SessionMember };
	expenses: Expense[];
	refunds: Expense[];
	isAdmin: boolean;
};

export const sessionCurrentState = atom<SessionCurrentState | undefined>({
	key: 'sessionCurrentState',
	default: undefined,
});
