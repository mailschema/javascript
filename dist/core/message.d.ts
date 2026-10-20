import { type Description } from './description.ts';
/**
 * Why a message's MAP part cannot be used: more than one designated part, a header that
 * readers could read differently, a transfer encoding other than base64 or quoted-printable,
 * a part not labelled exactly with this profile, a part outside a multipart/related entity
 * whose root is readable, an invalid description, or a message that cannot be read.
 */
export type MessageProblem = 'multiple_parts' | 'ambiguous_headers' | 'transfer_encoding' | 'media_type' | 'not_partial_representation' | 'invalid_description' | 'unreadable';
/** What a message carries: no MAP part, an unusable one and why, or its description. */
export type MessageResult = {
    status: 'none';
} | {
    status: 'invalid';
    reason: MessageProblem;
} | {
    status: 'valid';
    description: Description;
    bytes: Uint8Array;
};
/**
 * The MAP part of a received email (Core, "Email representation"), read from its original
 * bytes: the one designated description of this profile, in a multipart/related entity whose
 * root is the readable content it describes. A description inside an attachment or an
 * attached message is never read. It never throws for untrusted input. `bytes` are the
 * description exactly as the part carries it, after its transfer encoding is removed.
 */
export declare function extractMessage(input: string | Uint8Array): MessageResult;
