export interface Description {
    '@context': string;
    '@type': 'MailAction';
    '@id': string;
    profile: string;
    type: {
        id: string;
        version: string;
        contractDigest: string;
    };
    issuedAt: string;
    expiresAt: string;
    inLanguage: string;
    service: {
        id: string;
        tenant?: string;
    };
    recipient: string;
    subject: {
        id: string;
        title: string;
    };
    terms: {
        id: string;
        version: string;
    };
    details: Record<string, unknown>;
    operations: {
        id: string;
        capability?: {
            url: string;
        };
    }[];
    human: {
        url: string;
    };
}
/**
 * Why the value is not a MAP 0.3 description, or no reasons. Beyond the core schema:
 * expiry follows issuance, operation identifiers are unique, and no security-sensitive
 * identifier contains whitespace, a control or a formatting character.
 */
export declare function descriptionErrors(value: unknown): string[];
/** The description in the bytes or text, or InvalidDocument with every reason it is not one. */
export declare function parseDescription(input: string | Uint8Array): Description;
