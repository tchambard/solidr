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
            name: 'addSessionMember';
            docs: [
                '* Session administrator can add members.\n     *\n     * @dev members can be added only by session administrator when session is opened\n     * An event MemberAdded is emitted\n     *\n     * @param addr The address of the member to add\n     * @param name The nickname of the member to add',
            ];
            discriminator: [182, 216, 208, 245, 11, 232, 215, 63];
            accounts: [
                {
                    name: 'admin';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'session';
                    writable: true;
                },
                {
                    name: 'member';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'const';
                                value: [109, 101, 109, 98, 101, 114];
                            },
                            {
                                kind: 'account';
                                path: 'session.session_id';
                                account: 'sessionAccount';
                            },
                            {
                                kind: 'arg';
                                path: 'addr';
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
                    name: 'addr';
                    type: 'pubkey';
                },
                {
                    name: 'name';
                    type: 'string';
                },
            ];
        },
        {
            name: 'closeSession';
            docs: ['* Administrator can close sessions he created.\n     *\n     * @dev An event SessionClosed is emitted'];
            discriminator: [68, 114, 178, 140, 222, 38, 248, 211];
            accounts: [
                {
                    name: 'admin';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'session';
                    writable: true;
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
            ];
            args: [];
        },
        {
            name: 'initGlobal';
            discriminator: [44, 238, 77, 253, 76, 182, 192, 162];
            accounts: [
                {
                    name: 'global';
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
            name: 'joinSessionAsMember';
            docs: [
                "* Anyone can join a session with correct information provided with a share link.\n     *\n     * An event MemberAdded is emitted\n     *\n     * @param name The nickname of the member to add\n     * @param token The token shared by session's administrator",
            ];
            discriminator: [146, 154, 245, 82, 18, 241, 163, 206];
            accounts: [
                {
                    name: 'signer';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'session';
                    writable: true;
                },
                {
                    name: 'member';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'const';
                                value: [109, 101, 109, 98, 101, 114];
                            },
                            {
                                kind: 'account';
                                path: 'session.session_id';
                                account: 'sessionAccount';
                            },
                            {
                                kind: 'account';
                                path: 'signer';
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
                    name: 'token';
                    type: 'string';
                },
            ];
        },
        {
            name: 'openSession';
            docs: [
                "* Anyone can open new session. Session's creator becomes session administrator.\n     *\n     * @dev An event SessionCreated is emitted\n     *\n     * @param name The session name\n     * @param description The session description\n     * @param member_name The administrator's name",
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
                    name: 'member';
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: 'const';
                                value: [109, 101, 109, 98, 101, 114];
                            },
                            {
                                kind: 'account';
                                path: 'global.session_count';
                                account: 'globalAccount';
                            },
                            {
                                kind: 'account';
                                path: 'admin';
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
                {
                    name: 'memberName';
                    type: 'string';
                },
            ];
        },
        {
            name: 'setSessionTokenHash';
            docs: ["* Session's administrator can set invitation token hash\n     *\n     * @param hash The token hash to store in session"];
            discriminator: [162, 247, 90, 144, 182, 153, 184, 188];
            accounts: [
                {
                    name: 'admin';
                    writable: true;
                    signer: true;
                },
                {
                    name: 'session';
                    writable: true;
                },
                {
                    name: 'systemProgram';
                    address: '11111111111111111111111111111111';
                },
            ];
            args: [
                {
                    name: 'hash';
                    type: {
                        array: ['u8', 32];
                    };
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
            name: 'memberAccount';
            discriminator: [173, 25, 100, 97, 192, 177, 84, 139];
        },
        {
            name: 'sessionAccount';
            discriminator: [74, 34, 65, 133, 96, 163, 80, 69];
        },
    ];
    events: [
        {
            name: 'memberAdded';
            discriminator: [198, 220, 228, 196, 92, 235, 240, 79];
        },
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
        {
            code: 6002;
            name: 'forbiddenAsNonAdmin';
            msg: 'Only session administrator is granted';
        },
        {
            code: 6003;
            name: 'sessionClosed';
            msg: 'Session is closed';
        },
        {
            code: 6004;
            name: 'memberAlreadyExists';
            msg: 'Member already exists';
        },
        {
            code: 6005;
            name: 'missingInvitationHash';
            msg: 'Missing invitation link hash';
        },
        {
            code: 6006;
            name: 'invalidInvitationHash';
            msg: 'Invalid invitation link hash';
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
            name: 'memberAccount';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'sessionId';
                        type: 'u64';
                    },
                    {
                        name: 'addr';
                        type: 'pubkey';
                    },
                    {
                        name: 'name';
                        type: 'string';
                    },
                    {
                        name: 'isAdmin';
                        type: 'bool';
                    },
                ];
            };
        },
        {
            name: 'memberAdded';
            type: {
                kind: 'struct';
                fields: [
                    {
                        name: 'sessionId';
                        type: 'u64';
                    },
                    {
                        name: 'addr';
                        type: 'pubkey';
                    },
                    {
                        name: 'name';
                        type: 'string';
                    },
                    {
                        name: 'isAdmin';
                        type: 'bool';
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
                    {
                        name: 'invitationHash';
                        type: {
                            array: ['u8', 32];
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
