import { DialogTitle } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

import TransitionDialog from '../Dialog';
import { useTranslations } from 'next-intl';
import Dialog from '../Dialog';

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

const ConfirmationDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
}: ConfirmationDialogProps) => {
    const t = useTranslations();

    return (
        <Dialog onClose={onClose} isOpen={isOpen}>
            <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-100" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-zinc-900 dark:text-zinc-200">
                        {title}
                    </DialogTitle>
                    <div className="mt-2">
                        <p className="text-sm text-zinc-500 dark:text-zinc-300">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-customBlue dark:bg-customBlue px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-customBlueLight dark:hover:bg-customBlueLight focus:outline-none focus:ring-2 focus:ring-customBlue dark:focus:ring-customBlueLight focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={onConfirm}
                >
                    {t('common.confirm')}
                </button>
                <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2 text-base font-medium text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-customBlue dark:focus:ring-customBlue focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onClose}
                >
                    {t('common.cancel')}
                </button>
            </div>
        </Dialog>
    );
};

export default ConfirmationDialog;
