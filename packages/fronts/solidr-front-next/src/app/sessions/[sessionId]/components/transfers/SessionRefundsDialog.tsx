import React, { Suspense, useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRecoilValue } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import { Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { MemberTransfer } from '@solidr';
import Dialog from '@/components/Dialog';
import { DialogTitle } from '@headlessui/react';
import { useSolidrClient } from '@/providers/solidr/SolidrClientContext';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

interface ISessionRefundsDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export default ({ dialogVisible, setDialogVisible }: ISessionRefundsDialogProps) => {
    const t = useTranslations();

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useSolidrClient();
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const [transfers, setTransfers] = useState<MemberTransfer[]>([]);

    useEffect(() => {
        if (!sessionCurrent) {
            return;
        }

        setTransfers(
            sessionCurrent.transfers
                .filter((transfer) => transfer.from.toString() == anchorWallet.publicKey.toString())
                .map((transfer) => {
                    return {
                        ...transfer,
                    };
                }),
        );
    }, [sessionCurrent.transfers, anchorWallet.publicKey]);

    const { handleSubmit, formState: { isSubmitting } } = useForm({});

    const handleAmountUpdate = (to: PublicKey, amount: number) => {
        setTransfers(transfers.map((transfer) => {
            if (transfer.to.toString() == to.toString()) {
                transfer.amount = amount;
            }
            return transfer;
        }));
    };

    const onSubmit = async () => {
        if (!solidrClient || !sessionCurrent?.session || !transfers.length) return;

        const refundsToSend = transfers
            .filter((transfer) => transfer.amount > 0)
            .map((transfer) => {
                return { amount: transfer.amount, to: transfer.to };
            });
        console.log('refundsToSend :>> ', JSON.stringify(refundsToSend, null, 2));
        await solidrClient.sendRefunds(anchorWallet, sessionCurrent.session.sessionId, refundsToSend);
        console.log("OK")
        setDialogVisible(false);
    };

    if (!anchorWallet || !solidrClient || !sessionCurrent) return <Suspense />;

    return (
        <Dialog isOpen={dialogVisible} onClose={() => setDialogVisible(false)}>
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-center">
                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-zinc-900 dark:text-zinc-200">
                        {t('session.transfers.refunds.dialog.title')}
                    </DialogTitle>
                </div>
                <hr className="my-4 border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="mt-5 sm:mt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                    {transfers.map((transfer, idx) => (
                        <div key={`transfer_${idx}`} className="mb-4">
                            <label
                                htmlFor={`to_${transfer.to.toString()}`}
                                className="block text-zinc-900 dark:text-white mb-1"
                            >
                                {`${t('session.transfers.refunds.dialog.to.label')} ${sessionCurrent.members[transfer.to.toString()].name}`}
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 dark:text-zinc-400">
                                    $
                                </span>
                                <input
                                    id={`to_${transfer.to.toString()}`}
                                    type="number"
                                    defaultValue={transfer.amount}
                                    onChange={(e) =>
                                        handleAmountUpdate(transfer.to, Number(e.currentTarget.value))
                                    }
                                    className="w-full px-4 py-2 pl-10 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-customBlue focus:outline-none"
                                />
                            </div>
                        </div>
                    ))}

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 bg-customBlue hover:bg-customBlueLight text-white font-semibold rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        >
                            {t('common.submit')} &gt;
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-customBlue hover:text-customBlueLight font-semibold focus:outline-none"
                            onClick={() => setDialogVisible(false)}
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </Dialog >
    );
};
