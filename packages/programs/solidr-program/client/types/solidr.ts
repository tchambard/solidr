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
  ];
  accounts: [
    {
      name: 'globalAccount';
      discriminator: [129, 105, 124, 171, 189, 42, 108, 69];
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
  ];
};
