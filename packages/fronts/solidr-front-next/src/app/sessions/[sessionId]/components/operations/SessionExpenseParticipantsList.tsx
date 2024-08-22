import React from 'react';
import * as _ from 'lodash';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { useTranslations } from 'next-intl';

export interface IParticipant {
    name: string;
    address: PublicKey;
    checked: boolean;
}

type LabelContextProps = {
    participants: { [address: string]: IParticipant };
    handleParticipantOnClick(participant: IParticipant): void;
};
export default ({ participants, handleParticipantOnClick }: LabelContextProps) => {

    const t = useTranslations();
    const anchorWallet = useAnchorWallet() as Wallet;

    if (_.isEmpty(participants)) return;

    const current = _.find(participants, (part) => part.address.toString() == anchorWallet.publicKey.toString())!;
    const others = _.sortBy(
        _.filter(participants, (part) => part.address.toString() != anchorWallet.publicKey.toString()),
        ['name'],
    );

    return (
        <div>
            <label className="block text-zinc-900 dark:text-white mb-1">
                {t('session.operations.addExpense.form.participants.label')}
            </label>
            <div className="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg">
                <fieldset>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={true}
                                disabled={true}
                                id={`participant_${current.name}`}
                                className="form-checkbox h-5 w-5 text-customBlue border-zinc-300 dark:border-zinc-700 rounded disabled:opacity-50"
                            />
                            <label
                                htmlFor={`participant_${current.name}`}
                                className="ml-2 text-zinc-900 dark:text-white"
                            >
                                {current.name}
                            </label>
                        </div>

                        {_.map(others, (member) => (
                            <div className="flex items-center" key={`participant_${member.address}`}>
                                <input
                                    type="checkbox"
                                    checked={member.checked}
                                    id={`participant_${member.name}`}
                                    onChange={() => handleParticipantOnClick(member)}
                                    className="form-checkbox h-5 w-5 text-customBlue border-zinc-300 dark:border-zinc-700 rounded focus:ring-2 focus:ring-customBlue focus:outline-none"
                                />
                                <label
                                    htmlFor={`participant_${member.name}`}
                                    className="ml-2 text-zinc-900 dark:text-white"
                                >
                                    {member.name}
                                </label>
                            </div>
                        ))}
                    </div>
                </fieldset>
            </div>
        </div>
    );
};
