import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { assert } from 'chai';
import { Solidr, SolidrClient } from '../client';

describe('solidr', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.solidr as Program<Solidr>;

  const administrator = provider.wallet as anchor.Wallet;

  const client = new SolidrClient(program, { skipPreflight: false, preflightCommitment: 'confirmed' });

  before(async () => {
    // initialize program global account
    await client.initGlobal(administrator);
  });

  it('> should set session counter to zero', async () => {
    const globalPubkey = await client.findGlobalAccountAddress();
    const globalAccount = await client.getGlobalAccount(globalPubkey);
    assert.equal(globalAccount.sessionCount.toNumber(), 0);
  });
});
