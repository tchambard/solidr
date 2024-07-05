/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solidr.json`.
 */
export type Solidr = {
    address: '2xTttZsc5s65KyLmG1M6D5NpanUdYGj9SydbYnQFjnUP';
    metadata: {
        name: 'solidr';
        version: '0.1.0';
        spec: '0.1.0';
        description: 'The decentralized application for simple sharing expenses';
    };
    instructions: [
        {
            name: 'initGlobal';
            discriminator: [44, 238, 77, 253, 76, 182, 192, 162];
            accounts: [
                {
                    name: 'globalAccount';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'const';
                                value: [103, 108, 111, 98, 97, 108];
                            },
                        ];
                    };
                },
                {
                    name: 'owner';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
            ];
            args: [];
        },
        {
            name: 'openSession';
            docs: [
                "* Anyone can open new session. Session's creator becomes session administrator.\n     *\n     * @dev An event SessionCreated is emitted\n     *\n     * @param name The session name\n     * @param description The session description",
            ];
            discriminator: [130, 54, 124, 7, 236, 20, 104, 104];
            accounts: [
                {
                    name: 'admin';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'global';
                    writable: true;
                },
                {
                    name: 'session';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'const';
                                value: [115, 101, 115, 115, 105, 111, 110];
                            },
                            {
                                kind: 'account';
                                path: 'global.session_count';
                                account: 'globalAccount';
                            },
                        ];
                    };
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
            ];
            args: [
                {
                    name: 'name';
                    type: 'string';
                },
                {
                    name: 'description';
                    type: 'string';
                },
            ];
        },
    ];
    accounts: [
        {
            name: 'globalAccount';
            discriminator: [129, 105, 124, 171, 189, 42, 108, 69];
        },
        {
            name: 'sessionAccount';
            discriminator: [74, 34, 65, 133, 96, 163, 80, 69];
        },
    ];
    events: [
        {
            name: 'sessionClosed';
            discriminator: [57, 237, 11, 243, 194, 34, 120, 27];
        },
        {
            name: 'sessionOpened';
            discriminator: [34, 79, 77, 95, 195, 207, 104, 223];
        },
    ];
    errors: [
        {
            code: 6000;
            name: 'sessionNameTooLong';
            msg: "Session's name can't exceed 20 characters";
        },
        {
            code: 6001;
            name: 'sessionDescriptionTooLong';
            msg: "Session's description can't exceed 80 characters";
        },
    ];
    types: [
        {
            name: 'globalAccount';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'sessionCount';
                        type: 'u64';
                    },
                ];
            };
        },
        {
            name: 'sessionAccount';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'sessionId';
                        type: 'u64';
                    },
                    {
                        name: 'name';
                        type: 'string';
                    },
                    {
                        name: 'description';
                        type: 'string';
                    },
                    {
                        name: 'admin';
                        type: 'pubkey';
                    },
                    {
                        name: 'membersCount';
                        type: 'u8';
                    },
                    {
                        name: 'expensesCount';
                        type: 'u16';
                    },
                    {
                        name: 'status';
                        type: {
                            defined: {
                                name: 'sessionStatus';
                            };
                        };
                    },
                ];
            };
        },
        {
            name: 'sessionClosed';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'sessionId';
                        type: 'u64';
                    },
                ];
            };
        },
        {
            name: 'sessionOpened';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'sessionId';
                        type: 'u64';
                    },
                ];
            };
        },
        {
            name: 'sessionStatus';
            type: {
                kind: 'enum';
                variants: [
                    {
                        name: 'opened';
                    },
                    {
                        name: 'closed';
                    },
                ];
            };
        },
    ];
};
