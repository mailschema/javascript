/** A document that is not MAP JSON, or not the document it claims to be. */
export declare class InvalidDocument extends Error {
    readonly errors: string[];
    constructor(message: string, errors?: string[]);
}
export declare const MAX_DEPTH = 32;
/** The bytes as text, refusing anything but well-formed UTF-8. */
export declare function decodeUtf8(input: Uint8Array): string;
/**
 * Parse MAP JSON from its original text: UTF-8 I-JSON (RFC 7493) of at most `maxBytes`, with
 * no byte order mark, duplicate member names, lone surrogates, noncharacters or U+0000, no
 * container deeper than 32 counting the root as 1, and every number a finite token of at most
 * 64 characters within ±(2^53−1) that does not underflow to zero. These rules apply to the
 * original tokens, before a general parser could erase them.
 */
export declare function parse(input: string | Uint8Array, maxBytes: number): unknown;
/**
 * The RFC 8785 canonical form of a JSON value: members sorted by their UTF-16 code units,
 * ECMAScript's minimal string escapes and its number format.
 */
export declare function canonicalize(value: unknown): string;
/** `sha-256:` and the SHA-256 of the value's RFC 8785 form, as MAP identifies contracts. */
export declare const digest: (value: unknown) => string;
