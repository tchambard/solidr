import React, { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { ArchiveBoxXMarkIcon, ArrowLeftIcon, MinusCircleIcon, PencilIcon } from '@heroicons/react/24/solid';
import { SessionStatus } from '@solidr';
import { useTranslations } from 'next-intl';
import { Session } from '@solidr';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import ActionsMenu, { IActionMenuItem } from '@/components/ActionsMenu';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { useSolidrClient } from '@/providers/solidr/SolidrClientContext';
import { Wallet } from '@coral-xyz/anchor';

export default ({ session }: { session: Session }) => {
    const router = useRouter();
    const t = useTranslations();

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useSolidrClient();

    const [showConfirmCloseDialog, setShowConfirmCloseDialog] = useState<boolean>(false);
    const [showConfirmDeleteDialog, setShowConfirmDeleteDialog] = useState<boolean>(false);

    const [menuItems, setMenuItems] = useState<IActionMenuItem[]>([]);

    useEffect(() => {
        const _menuItems: IActionMenuItem[] = [];

        if (anchorWallet && session.admin.toString() === anchorWallet.publicKey.toString()) {
            if (session.status == SessionStatus.Opened) {
                _menuItems.push({
                    title: t('session.action.edit.menu.title'),
                    description: t('session.action.edit.menu.description'),
                    onClick: () => router.push(`/sessions/${session.sessionId}/edit`),
                    icon: <PencilIcon className="w-6 h-6" />,
                });
                _menuItems.push({
                    title: t('session.action.close.menu.title'),
                    description: t('session.action.close.menu.description'),
                    onClick: () => setShowConfirmCloseDialog(true),
                    icon: <MinusCircleIcon className="w-6 h-6" />,
                });
            }
            if (session.status == SessionStatus.Closed) {
                _menuItems.push({
                    title: t('session.action.delete.menu.title'),
                    description: t('session.action.delete.menu.description'),
                    onClick: () => setShowConfirmDeleteDialog(true),
                    icon: <ArchiveBoxXMarkIcon className="w-6 h-6" />,
                });
            }
        }

        setMenuItems(_menuItems);
    }, [session]);

    if (!solidrClient || !anchorWallet) {
        return <Suspense />;
    }

    return (
        <>
            <PageTitleWrapper>
                <div className="flex items-center">
                    <button onClick={() => router.push('/sessions')} className="mr-4 cursor-pointer">
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                    <div>
                        <h3 className="text-3xl mb-1 flex items-center">
                            {session.name}
                            {session.status === SessionStatus.Closed && (
                                <span className="ml-4 text-red-600 border border-red-600 rounded px-2 py-1 text-xs">
                                    {t('session.closed.title')}
                                </span>
                            )}
                        </h3>
                        <p className="text-sm">
                            {session.description}
                        </p>
                    </div>
                </div>

                <div>
                    {menuItems.length > 0 && (
                        <ActionsMenu items={menuItems} />
                    )}
                </div>

            </PageTitleWrapper>

            <ConfirmationDialog
                isOpen={showConfirmCloseDialog}
                onClose={() => setShowConfirmCloseDialog(false)}
                onConfirm={async () => {
                    await solidrClient.closeSession(anchorWallet, session.sessionId);
                    setShowConfirmCloseDialog(false)
                }}
                title={t('session.action.close.confirm.title')}
                description={t('session.action.close.confirm.description')}
            />

            <ConfirmationDialog
                isOpen={showConfirmDeleteDialog}
                onClose={() => setShowConfirmDeleteDialog(false)}
                onConfirm={async () => {
                    await solidrClient.deleteSession(anchorWallet, session.sessionId);
                    setShowConfirmDeleteDialog(false)
                }}
                title={t('session.action.delete.confirm.title')}
                description={t('session.action.delete.confirm.description')}
            />
        </>

    );
};
