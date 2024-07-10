import { Keypair } from '@solana/web3.js';
import { randomBytes } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';

export type SessionLinkToken = {
    token: string;
    hash: Uint8Array;
};

export type SessionLinkTokenData = {
    sessionId: string;
    nonce: string;
    admin: string;
};

export function generateSessionLinkTokenData(sessionId: string, signer: Keypair): SessionLinkToken {
    const nonce = Buffer.from(randomBytes(16)).toString('hex');
    const token = encodeSessionLinkToken([sessionId, nonce, signer.publicKey.toBase58()]);
    const hash = hashToken(token);
    return { token, hash };
}

export function encodeSessionLinkToken(token: string[]): string {
    return Buffer.from(JSON.stringify(token)).toString('base64');
}

export function decodeSessionLinkToken(tokenBase64: string): string[] {
    const decodedString = Buffer.from(tokenBase64, 'base64').toString('utf-8');
    return JSON.parse(decodedString);
}

export function hashToken(token: string): Uint8Array {
    const message = new TextEncoder().encode(token);
    return sha256(message);
}
