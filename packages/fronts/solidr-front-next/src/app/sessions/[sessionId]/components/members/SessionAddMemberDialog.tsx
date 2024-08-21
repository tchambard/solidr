import React, { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form-mui';
import { DialogTitle } from '@headlessui/react';
import { useRecoilValue } from 'recoil';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { sessionCurrentState } from '@/store/sessions';
import { PublicKey } from '@solana/web3.js';
import { useTranslations } from 'next-intl';
import Dialog from '@/components/Dialog';
import { useSolidrClient } from '@/providers/solidr/SolidrClientContext';

interface IAddMemberDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IRegisterMemberParams {
    address: string;
    memberName: string;
}

export default ({ dialogVisible, setDialogVisible }: IAddMemberDialogProps) => {

    const t = useTranslations();

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useSolidrClient();
    const { session } = useRecoilValue(sessionCurrentState);

    const [formData, setFormData] = useState<Partial<IRegisterMemberParams>>({});

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formData,
    });

    const onSubmit = async (data: Partial<IRegisterMemberParams>) => {
        if (!solidrClient || !session || !data.address || !data.memberName) return;
        setFormData(data);
        await solidrClient.addSessionMember(anchorWallet, session.sessionId, new PublicKey(data.address), data.memberName);
        setDialogVisible(false);
    };

    if (!anchorWallet || !solidrClient || !session) return <Suspense />;

    return (
        <Dialog isOpen={dialogVisible} onClose={() => setDialogVisible(false)}>
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-center">
                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">
                        {t('session.members.add.title')}
                    </DialogTitle>
                </div>
                <hr className="my-4 border-gray-300 dark:border-gray-700" />
            </div>
            <div className="mt-5 sm:mt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-gray-900 dark:text-white mb-1" htmlFor="address">
                            {t('session.members.add.form.address.label')}
                        </label>
                        <input
                            type="text"
                            id="address"
                            {...register('address', { required: true })}
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.address && <span className="text-red-500 text-sm">{t('session.members.add.form.address.required')}</span>}
                    </div>

                    <div>
                        <label className="block text-gray-900 dark:text-white mb-1" htmlFor="memberName">
                            {t('session.members.add.form.memberName.label')}
                        </label>
                        <input
                            type="text"
                            id="memberName"
                            {...register('memberName', { required: true })}
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.memberName && <span className="text-red-500 text-sm">{t('session.members.add.form.memberName.required')}</span>}
                    </div>

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
        </Dialog>
    );
};
