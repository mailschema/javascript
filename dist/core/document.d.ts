/** A MAP document that is not I-JSON within the core limits. */
export declare class InvalidDocument extends Error {
}
export declare const MAX_BYTES: number;
export declare const MAX_DEPTH = 32;
/**
 * Parse a MAP document as I-JSON (RFC 7493) within the core limits: valid UTF-8 with no
 * byte order mark, at most 64 KiB, no duplicate member names, no lone surrogates,
 * noncharacters or U+0000 in any string, every number within ±(2^53−1), and arrays and
 * objects nested at most 32 deep, the outermost counting as one. Text is measured in its
 * UTF-8 bytes; bytes must be strict UTF-8.
 */
export declare function parse(input: string | Uint8Array): unknown;
/**
 * The RFC 8785 canonical form of a JSON value: members sorted by their UTF-16 code units,
 * ECMAScript's minimal string escapes and its number format. An undefined member is
 * left out and an undefined array item is null, as JSON.stringify writes them.
 */
export declare function canonicalize(value: unknown): string;
/**
 * `sha-256:` and the SHA-256 of the RFC 8785 canonical form: the digest MAP uses for
 * descriptions, contracts and pinned schemas.
 */
export declare const digest: (value: unknown) => string;
