import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useFormatter, useTranslations } from 'next-intl';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

import AddressAvatar from '@/components/AddressAvatar';
import SectionTitleWrapper from '@/components/SectionTitleWrapper';
import Tooltip from '@/components/Tooltip';
import { sessionCurrentState } from '@/store/sessions';
import SessionRefundsDialog from './SessionRefundsDialog';

export default () => {
    const t = useTranslations();
    const format = useFormatter();

    const anchorWallet = useAnchorWallet() as Wallet;
    const sessionCurrent = useRecoilValue(sessionCurrentState);
    const [displayRefundDialog, setDisplayRefundDialog] = useState(false);
    const [haveRefunds, setHaveRefunds] = useState(false);

    useEffect(() => {
        if (!sessionCurrent) return;
        setHaveRefunds(sessionCurrent.transfers.filter((transfer) => transfer.from.toString() == anchorWallet.publicKey.toString()).length > 0);
    }, [sessionCurrent.transfers]);

    return (
        <div className="w-full">
            <SectionTitleWrapper>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
                    {t('session.transfers.title')}
                </h1>
                <div className="flex items-center space-x-2">
                    {haveRefunds && (
                        <button
                            type="submit"
                            onClick={() => setDisplayRefundDialog(true)}
                            className="w-full px-4 py-2 bg-customBlue hover:bg-customBlueLight text-white font-semibold rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        >
                            {t('session.transfers.button.title')}
                        </button>
                    )}
                </div>
            </SectionTitleWrapper>

            {sessionCurrent.transfers.length > 0 ? (
                <div className="w-full">
                    {sessionCurrent.transfers.map((transfer, idx) => (
                        <div key={`transfer_${idx}`} className="py-2">
                            <div className="flex items-center justify-between">
                                {/* From Section */}
                                <div className="flex flex-col items-center w-1/5">
                                    <Tooltip text={transfer.from.toString()}>
                                        <div>
                                            <AddressAvatar address={transfer.from.toString()} />
                                        </div>
                                    </Tooltip>
                                    <p className="text-md text-gray-900 dark:text-gray-300 mt-2">
                                        {sessionCurrent.members[transfer.from.toString()].name}
                                    </p>
                                </div>

                                {/* Middle Section */}
                                <div className="flex flex-col items-center w-3/5">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {t('session.transfers.list.item.owes')}
                                    </span>
                                    <div className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-full p-1 my-2">
                                        <ArrowRightIcon className="w-6 h-6 text-gray-900 dark:text-white" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {format.number(+Number(transfer.amount).toFixed(2), { style: 'currency', currency: 'USD' })}
                                    </p>
                                </div>

                                {/* To Section */}
                                <div className="flex flex-col items-center w-1/5">
                                    <Tooltip text={transfer.to.toString()}>
                                        <div>
                                            <AddressAvatar address={transfer.to.toString()} />
                                        </div>
                                    </Tooltip>
                                    <p className="text-md text-gray-900 dark:text-gray-300 mt-2">
                                        {sessionCurrent.members[transfer.to.toString()].name}
                                    </p>
                                </div>
                            </div>
                            {idx < sessionCurrent.transfers.length - 1 && (
                                <hr className="border-t border-gray-300 dark:border-gray-700 mt-4" />
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-700 dark:text-gray-300 mt-4">
                    {t('session.transfers.list.empty')}
                </p>
            )}

            {displayRefundDialog && <SessionRefundsDialog dialogVisible={displayRefundDialog} setDialogVisible={setDisplayRefundDialog} />}
        </div>
    );
};
