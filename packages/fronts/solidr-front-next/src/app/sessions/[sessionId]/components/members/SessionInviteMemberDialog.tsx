import React, { Suspense, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useAnchorWallet, useLocalStorage } from '@solana/wallet-adapter-react';
import { BN, Wallet } from '@coral-xyz/anchor';
import { sessionCurrentState } from '@/store/sessions';
import QRCode from 'qrcode.react';
import { useSolidrClient } from '@/providers/solidr/SolidrClientContext';
import Dialog from '@/components/Dialog';
import { ClipboardIcon } from '@heroicons/react/24/solid';
import { useTranslations } from 'next-intl';
import { DialogTitle } from '@headlessui/react';

interface IInviteMemberDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function InviteMemberDialog({ dialogVisible, setDialogVisible }: IInviteMemberDialogProps) {
    const t = useTranslations();
    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useSolidrClient();
    const sessionCurrent = useRecoilValue(sessionCurrentState);
    const [invitationToken, setInvitationToken] = useLocalStorage(`solidr.sessions.${sessionCurrent?.session?.sessionId}`, "");
    const [url, setUrl] = useState('');

    const generateUrl = () => {
        if (!solidrClient || !sessionCurrent?.session) return;

        const invitationUrl = `${window.location.origin}/sessions/${sessionCurrent.session.sessionId}/join/${invitationToken}`;
        setUrl(invitationUrl);
    };

    const onSubmit = async () => {
        if (!solidrClient || !sessionCurrent.session) return;
        const { data: { token } } = await solidrClient.generateSessionLink(anchorWallet, new BN(sessionCurrent.session.sessionId))
        setInvitationToken(token);
        generateUrl();
    };

    useEffect(() => {
        if (invitationToken) {
            generateUrl();
        }
    }, [invitationToken]);

    if (!anchorWallet || !solidrClient || !sessionCurrent?.session) return <Suspense />;

    return (
        <Dialog isOpen={dialogVisible} onClose={() => setDialogVisible(false)}>
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-center">
                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">
                        {t('session.share.title')}
                    </DialogTitle>
                </div>
                <hr className="my-4 border-gray-300 dark:border-gray-700" />
            </div>
            <div className="px-4 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
                <div className="mt-4">
                    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                        {url && invitationToken && (
                            <>
                                <div className="w-full">
                                    <label htmlFor="generated-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {t('session.share.generatedUrl.title')}
                                    </label>
                                    <div className="mt-1 flex rounded-md shadow-sm">

                                        <input
                                            type="text"
                                            id="generated-url"
                                            value={url}
                                            readOnly
                                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => navigator.clipboard.writeText(url)}
                                            className="inline-flex items-center px-3 rounded-r-md border border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                                        >
                                            <ClipboardIcon className="w-6 h-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <QRCode value={url} size={256} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex space-x-4 pt-4">

                <button
                    type="submit"
                    className="w-full px-4 py-2 bg-customBlue hover:bg-customBlueLight text-white font-semibold rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                    onClick={onSubmit}
                >
                    {t('session.share.generateLink.title')}
                </button>
                <button
                    type="button"
                    className="px-4 py-2 text-customBlue hover:text-customBlueLight font-semibold focus:outline-none"
                    onClick={() => setDialogVisible(false)}
                >
                    {t('common.cancel')}
                </button>
            </div>
        </Dialog>
    );
}
