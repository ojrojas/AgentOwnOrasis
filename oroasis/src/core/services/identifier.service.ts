import * as crypto from 'node:crypto';

export function getIdentifier(): string {
    return crypto.randomBytes(32).toString('hex');
}