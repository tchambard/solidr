/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/solidr.json`.
 */
export type Solidr = {
  "address": "7kUL66rcAhxgisSeBtXoH7Pn9C5hWZa4m2Bp9mRcwtmv",
  "metadata": {
    "name": "solidr",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "The decentralized application for simple sharing expenses"
  },
  "instructions": [
    {
      "name": "addExpense",
      "docs": [
        "* Adds a new expense to the session.\n     *\n     * @param name The name of the expense\n     * @param amount The amount of the expense"
      ],
      "discriminator": [
        171,
        23,
        8,
        240,
        62,
        31,
        254,
        144
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "member",
          "writable": true
        },
        {
          "name": "expense",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  120,
                  112,
                  101,
                  110,
                  115,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "session.session_id",
                "account": "sessionAccount"
              },
              {
                "kind": "account",
                "path": "session.expenses_count",
                "account": "sessionAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "f32"
        },
        {
          "name": "participants",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "addExpenseParticipants",
      "docs": [
        "* Adds participants to expense.\n     *\n     * @param participants The public keys of the participants"
      ],
      "discriminator": [
        4,
        224,
        182,
        171,
        3,
        134,
        164,
        27
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "expense",
          "writable": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "participants",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "addRefund",
      "docs": [
        "* Adds a new refund to the session. lamports corresponding to given amount will be transfered to mentionned \"to\" account\n     *\n     * @param amount The amount of the refund corresponding to session currency\n     * @param amount_in_lamports The amount in lamports of the refund. It must be calculated offchain."
      ],
      "discriminator": [
        174,
        141,
        186,
        43,
        213,
        19,
        84,
        140
      ],
      "accounts": [
        {
          "name": "fromAddr",
          "writable": true,
          "signer": true
        },
        {
          "name": "sender",
          "writable": true
        },
        {
          "name": "toAddr",
          "writable": true
        },
        {
          "name": "receiver",
          "writable": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "refund",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  102,
                  117,
                  110,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "session.session_id",
                "account": "sessionAccount"
              },
              {
                "kind": "account",
                "path": "session.refunds_count",
                "account": "sessionAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "f32"
        },
        {
          "name": "amountInLamports",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addSessionMember",
      "docs": [
        "* Session administrator can add members.\n     *\n     * @dev members can be added only by session administrator when session is opened\n     * An event MemberAdded is emitted\n     *\n     * @param addr The address of the member to add\n     * @param name The nickname of the member to add"
      ],
      "discriminator": [
        182,
        216,
        208,
        245,
        11,
        232,
        215,
        63
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "member",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "session.session_id",
                "account": "sessionAccount"
              },
              {
                "kind": "arg",
                "path": "addr"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "addr",
          "type": "pubkey"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "closeSession",
      "docs": [
        "* Administrator can close sessions he created.\n     *\n     * @dev An event SessionClosed is emitted"
      ],
      "discriminator": [
        68,
        114,
        178,
        140,
        222,
        38,
        248,
        211
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "deleteExpense",
      "docs": [
        "* Deletes an existing expense in the session.\n     *\n     * @param name The name of the expense to be deleted\n     * @param amount The amount of the expense to be deleted"
      ],
      "discriminator": [
        117,
        203,
        143,
        99,
        175,
        155,
        125,
        144
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "expense",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "deleteRefund",
      "discriminator": [
        225,
        116,
        74,
        229,
        247,
        76,
        14,
        6
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "refund",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deleteSession",
      "docs": [
        "* Session's administrator can delete the session.\n     *\n     * @dev An event SessionDeleted is emitted"
      ],
      "discriminator": [
        145,
        247,
        92,
        192,
        209,
        128,
        187,
        189
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deleteSessionMember",
      "docs": [
        "* Session administrator can remove a member from the session.\n     *\n     * @dev Members can be removed only by session administrator when session is opened\n     * An event MemberRemoved is emitted"
      ],
      "discriminator": [
        87,
        38,
        145,
        255,
        242,
        94,
        180,
        202
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "member",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initGlobal",
      "discriminator": [
        44,
        238,
        77,
        253,
        76,
        182,
        192,
        162
      ],
      "accounts": [
        {
          "name": "global",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  108,
                  111,
                  98,
                  97,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "joinSessionAsMember",
      "docs": [
        "* Anyone can join a session with correct information provided with a share link.\n     *\n     * An event MemberAdded is emitted\n     *\n     * @param name The nickname of the member to add\n     * @param token The token shared by session's administrator"
      ],
      "discriminator": [
        146,
        154,
        245,
        82,
        18,
        241,
        163,
        206
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "member",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "session.session_id",
                "account": "sessionAccount"
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "token",
          "type": "string"
        }
      ]
    },
    {
      "name": "openSession",
      "docs": [
        "* Anyone can open new session. Session's creator becomes session administrator.\n     *\n     * @dev An event SessionCreated is emitted\n     *\n     * @param name The session name\n     * @param description The session description\n     * @param member_name The administrator's name"
      ],
      "discriminator": [
        130,
        54,
        124,
        7,
        236,
        20,
        104,
        104
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "global",
          "writable": true
        },
        {
          "name": "session",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "global.session_count",
                "account": "globalAccount"
              }
            ]
          }
        },
        {
          "name": "member",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  109,
                  98,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "global.session_count",
                "account": "globalAccount"
              },
              {
                "kind": "account",
                "path": "admin"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "memberName",
          "type": "string"
        }
      ]
    },
    {
      "name": "removeExpenseParticipants",
      "docs": [
        "* Removes participant from expense.\n     *\n     * @param participants The public keys of the participants"
      ],
      "discriminator": [
        248,
        203,
        50,
        173,
        70,
        6,
        146,
        166
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "expense",
          "writable": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "participants",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "setSessionTokenHash",
      "docs": [
        "* Session's administrator can set invitation token hash\n     *\n     * @param hash The token hash to store in session"
      ],
      "discriminator": [
        162,
        247,
        90,
        144,
        182,
        153,
        184,
        188
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "hash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "updateExpense",
      "docs": [
        "* Updates an existing expense in the session.\n     *\n     * @param name The name of the expense to be updated\n     * @param amount The new amount of the expense"
      ],
      "discriminator": [
        122,
        188,
        72,
        67,
        172,
        189,
        179,
        163
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "expense",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "amount",
          "type": "f32"
        }
      ]
    },
    {
      "name": "updateSession",
      "docs": [
        "* Session's administrator can update the session's name and description.\n     *\n     * @param name The new session name\n     * @param description The new session description"
      ],
      "discriminator": [
        173,
        25,
        235,
        79,
        40,
        217,
        155,
        103
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateSessionMember",
      "discriminator": [
        115,
        250,
        161,
        78,
        77,
        56,
        115,
        45
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "session",
          "writable": true
        },
        {
          "name": "member",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "expenseAccount",
      "discriminator": [
        35,
        2,
        83,
        124,
        115,
        159,
        63,
        133
      ]
    },
    {
      "name": "globalAccount",
      "discriminator": [
        129,
        105,
        124,
        171,
        189,
        42,
        108,
        69
      ]
    },
    {
      "name": "memberAccount",
      "discriminator": [
        173,
        25,
        100,
        97,
        192,
        177,
        84,
        139
      ]
    },
    {
      "name": "refundAccount",
      "discriminator": [
        33,
        196,
        176,
        53,
        44,
        213,
        37,
        99
      ]
    },
    {
      "name": "sessionAccount",
      "discriminator": [
        74,
        34,
        65,
        133,
        96,
        163,
        80,
        69
      ]
    }
  ],
  "events": [
    {
      "name": "expenseAdded",
      "discriminator": [
        161,
        49,
        47,
        2,
        245,
        167,
        224,
        67
      ]
    },
    {
      "name": "expenseDeleted",
      "discriminator": [
        246,
        52,
        62,
        55,
        242,
        249,
        158,
        23
      ]
    },
    {
      "name": "expenseParticipantAdded",
      "discriminator": [
        116,
        202,
        216,
        162,
        22,
        73,
        148,
        87
      ]
    },
    {
      "name": "expenseParticipantRemoved",
      "discriminator": [
        37,
        178,
        57,
        228,
        101,
        203,
        244,
        215
      ]
    },
    {
      "name": "expenseUpdated",
      "discriminator": [
        132,
        21,
        179,
        234,
        31,
        228,
        223,
        159
      ]
    },
    {
      "name": "memberAdded",
      "discriminator": [
        198,
        220,
        228,
        196,
        92,
        235,
        240,
        79
      ]
    },
    {
      "name": "memberDeleted",
      "discriminator": [
        197,
        176,
        249,
        151,
        163,
        55,
        70,
        154
      ]
    },
    {
      "name": "memberUpdated",
      "discriminator": [
        122,
        225,
        250,
        121,
        60,
        189,
        11,
        147
      ]
    },
    {
      "name": "refundAdded",
      "discriminator": [
        97,
        13,
        130,
        101,
        137,
        7,
        155,
        116
      ]
    },
    {
      "name": "refundDeleted",
      "discriminator": [
        171,
        242,
        116,
        20,
        107,
        251,
        175,
        16
      ]
    },
    {
      "name": "sessionClosed",
      "discriminator": [
        57,
        237,
        11,
        243,
        194,
        34,
        120,
        27
      ]
    },
    {
      "name": "sessionDeleted",
      "discriminator": [
        198,
        203,
        193,
        19,
        12,
        170,
        11,
        113
      ]
    },
    {
      "name": "sessionOpened",
      "discriminator": [
        34,
        79,
        77,
        95,
        195,
        207,
        104,
        223
      ]
    },
    {
      "name": "sessionUpdated",
      "discriminator": [
        44,
        208,
        225,
        11,
        203,
        208,
        34,
        197
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "overflow",
      "msg": "Overflow when performing arithmetic operations"
    },
    {
      "code": 6001,
      "name": "divisionByZero",
      "msg": "Division by zero when converting amount to lamports"
    },
    {
      "code": 6002,
      "name": "sessionNameTooLong",
      "msg": "Session's name can't exceed 20 characters"
    },
    {
      "code": 6003,
      "name": "sessionDescriptionTooLong",
      "msg": "Session's description can't exceed 80 characters"
    },
    {
      "code": 6004,
      "name": "forbiddenAsNonAdmin",
      "msg": "Only session administrator is granted"
    },
    {
      "code": 6005,
      "name": "forbiddenAsNonOwner",
      "msg": "Only owner can update his informations"
    },
    {
      "code": 6006,
      "name": "sessionClosed",
      "msg": "Session is closed"
    },
    {
      "code": 6007,
      "name": "sessionNotClosed",
      "msg": "Session is not closed"
    },
    {
      "code": 6008,
      "name": "memberAlreadyExists",
      "msg": "Member already exists"
    },
    {
      "code": 6009,
      "name": "missingInvitationHash",
      "msg": "Missing invitation link hash"
    },
    {
      "code": 6010,
      "name": "invalidInvitationHash",
      "msg": "Invalid invitation link hash"
    },
    {
      "code": 6011,
      "name": "expenseAmountMustBeGreaterThanZero",
      "msg": "Expense amount must be greater than zero"
    },
    {
      "code": 6012,
      "name": "refundAmountMustBeGreaterThanZero",
      "msg": "Refund amount must be greater than zero"
    },
    {
      "code": 6013,
      "name": "expenseNameTooLong",
      "msg": "Expense's name can't exceed 20 characters"
    },
    {
      "code": 6014,
      "name": "maxParticipantsReached",
      "msg": "Expense cannot have more than 20 participants"
    },
    {
      "code": 6015,
      "name": "notSessionMember",
      "msg": "Only session member can add an expense"
    },
    {
      "code": 6016,
      "name": "notExpenseOwner",
      "msg": "Only expense owner can update or delete expense"
    },
    {
      "code": 6017,
      "name": "participantNotMember",
      "msg": "Only members can be added as participants"
    },
    {
      "code": 6018,
      "name": "cannotRemoveExpenseOwner",
      "msg": "Expense owner cannot be removed from participants"
    }
  ],
  "types": [
    {
      "name": "expenseAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "expenseId",
            "type": "u16"
          },
          {
            "name": "date",
            "type": "i64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "f32"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "participants",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "expenseAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "expenseId",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "expenseDeleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "expenseId",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "expenseParticipantAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "expenseId",
            "type": "u16"
          },
          {
            "name": "memberPubkey",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "expenseParticipantRemoved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "expenseId",
            "type": "u16"
          },
          {
            "name": "memberPubkey",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "expenseUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "expenseId",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "globalAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "memberAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "addr",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "isAdmin",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "memberAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "addr",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "isAdmin",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "memberDeleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "addr",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "memberUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "addr",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "refundAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "refundId",
            "type": "u16"
          },
          {
            "name": "date",
            "type": "i64"
          },
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "to",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "f32"
          },
          {
            "name": "amountInLamports",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "refundAdded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "refundId",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "refundDeleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "refundId",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "sessionAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "expensesCount",
            "type": "u16"
          },
          {
            "name": "refundsCount",
            "type": "u16"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "sessionStatus"
              }
            }
          },
          {
            "name": "invitationHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "sessionClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "sessionDeleted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "sessionOpened",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "sessionStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "opened"
          },
          {
            "name": "closed"
          }
        ]
      }
    },
    {
      "name": "sessionUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "sessionId",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
