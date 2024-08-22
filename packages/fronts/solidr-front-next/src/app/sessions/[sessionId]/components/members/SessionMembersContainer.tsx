

import _ from 'lodash';
import { sessionCurrentState } from '@/store/sessions';
import { PaperAirplaneIcon, PencilIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { SessionMember, SessionStatus } from '@solidr';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import SessionAddMemberDialog from './SessionAddMemberDialog';
import SessionInviteMemberDialog from './SessionInviteMemberDialog';
import SectionTitleWrapper from '@/components/SectionTitleWrapper';
import AddressAvatar from '@/components/AddressAvatar';
import { Wallet } from '@coral-xyz/anchor';
import SessionBalance from './SessionBalance';
import SessionEditMemberDialog from './SessionEditMemberDialog';

export default () => {
    const t = useTranslations();

    const wallet = useAnchorWallet() as Wallet;
    const [addMemberDialogVisible, setAddMemberDialogVisible] = useState(false);
    const [inviteMemberDialogVisible, setInviteMemberDialogVisible] = useState(false);
    const [editMemberDialogVisible, setEditMemberDialogVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<SessionMember | undefined>(undefined);

    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const handleMemberClick = (member: SessionMember) => {
        if (wallet.publicKey?.toString() != member.addr.toString() && !sessionCurrent.isAdmin) {
            return;
        }

        setSelectedMember(member);
        setEditMemberDialogVisible(true);
    };

    return <div className="w-full">
        <SectionTitleWrapper>
            <h1 className="text-xl font-bold text-zinc-800 dark:text-white tracking-wide">
                {t('session.members.list.title')}
            </h1>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setAddMemberDialogVisible(true)}
                    className="focus:outline-none"
                >
                    <PlusCircleIcon className="w-6 h-6" aria-hidden="true" />
                </button>
                <button
                    onClick={() => setInviteMemberDialogVisible(true)}
                    className="focus:outline-none"
                >
                    <PaperAirplaneIcon className="w-6 h-6" aria-hidden="true" />
                </button>
            </div>
        </SectionTitleWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
                <ul className="w-full p-4 max-h-120 overflow-y-auto">
                    {_.map(sessionCurrent.members, (member, address) => (
                        <li key={`member_${address}`} className="flex items-center justify-between py-2 border-b border-zinc-200 dark:border-zinc-700">
                            <div className="flex items-center space-x-4">
                                <div className="tooltip" data-tooltip={address}>
                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                        <AddressAvatar address={address} />
                                    </div>
                                </div>
                                <span className="text-zinc-800 dark:text-zinc-200">{member.name}</span>
                            </div>
                            {(wallet.publicKey.toString() === member.addr.toString() || sessionCurrent.isAdmin) && sessionCurrent.session?.status === SessionStatus.Opened && (
                                <button
                                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 focus:outline-none"
                                    onClick={() => handleMemberClick(member)}
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="md:col-span-2">
                <SessionBalance />
            </div>
        </div>

        <SessionAddMemberDialog dialogVisible={addMemberDialogVisible} setDialogVisible={setAddMemberDialogVisible} />
        <SessionInviteMemberDialog dialogVisible={inviteMemberDialogVisible} setDialogVisible={setInviteMemberDialogVisible} />
        {selectedMember && <SessionEditMemberDialog member={selectedMember} dialogVisible={editMemberDialogVisible} setDialogVisible={setEditMemberDialogVisible} />}
    </div>
}