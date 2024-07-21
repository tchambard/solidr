import * as _ from 'lodash';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from '@mui/material';
import React from 'react';
import { PublicKey } from '@solana/web3.js';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';

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
    if (_.isEmpty(participants)) return;

    const anchorWallet = useAnchorWallet() as Wallet;

    const current = _.find(participants, (part) => part.address.toString() == anchorWallet.publicKey.toString());
    const others = _.sortBy(
        _.filter(participants, (part) => part.address.toString() != anchorWallet.publicKey.toString()),
        ['name'],
    );

    return (
        <FormControl component="fieldset" sx={{ m: 3 }} variant="standard">
            <FormLabel component="legend">Choose participants</FormLabel>
            <FormGroup>
                <FormControlLabel control={<Checkbox checked={true} disabled={true} name={current.name} />} label={current.name} />
                {_.map(others, (member) => (
                    <FormControlLabel control={<Checkbox checked={member.checked} name={member.name} onChange={() => handleParticipantOnClick(member)} />} label={member.name} />
                ))}
            </FormGroup>
        </FormControl>
    );
};
