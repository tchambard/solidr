import { atom } from "recoil";
import { SolidrClient } from "@solidr";

type TxState = {
    pending: boolean;
    error?: string;
};

export const txState = atom<TxState>({
    key: "txState",
    default: {
        pending: false,
    },
    dangerouslyAllowMutability: true,
});

export const solidrClientState = atom<SolidrClient | undefined>({
    key: "solidrClientState",
    default: undefined,
    dangerouslyAllowMutability: true,
});
