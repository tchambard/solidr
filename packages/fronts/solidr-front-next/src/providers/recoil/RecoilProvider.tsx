"use client";

import React, { ReactNode } from "react";
import { RecoilRoot } from "recoil";

type Props = {
    children: ReactNode;
};

const RecoilContextProvider = ({ children }: Props) => {
    return <RecoilRoot>{children}</RecoilRoot>;
};
export default RecoilContextProvider;