import { PROFILE } from "./artifacts.js";
import { parseDescription } from "./description.js";
import { InvalidDocument } from "./json.js";
const READABLE = new Set(['text/plain', 'text/html']);
const TRANSFER_ENCODINGS = new Set(['base64', 'quoted-printable']);
const SINGLE_FIELDS = ['content-type', 'content-purpose', 'content-transfer-encoding'];
const FIELD = /^([!-9;-~]+):[ \t]*([\s\S]*)$/;
const PARAMETER = /^\s*([!#$%&'*+.^_`|~0-9A-Za-z-]+)\s*=/;
/**
 * The MAP part of a received email (Core, "Email representation"), read from its original
 * bytes: the one designated description of this profile, in a multipart/related entity whose
 * root is the readable content it describes. A description inside an attachment or an
 * attached message is never read. It never throws for untrusted input. `bytes` are the
 * description exactly as the part carries it, after its transfer encoding is removed.
 */
export function extractMessage(input) {
    try {
        const raw = typeof input === 'string' ? input : binary(input);
        const designated = entities(entity(raw)).filter(([part]) => isDesignated(part));
        if (!designated.length)
            return { status: 'none' };
        if (designated.length > 1)
            return invalid('multiple_parts');
        const [part, parent] = designated[0];
        const reason = problem(part, parent);
        if (reason)
            return invalid(reason);
        const bytes = decoded(part);
        try {
            return { status: 'valid', description: parseDescription(bytes), bytes };
        }
        catch (error) {
            if (error instanceof InvalidDocument)
                return invalid('invalid_description');
            throw error;
        }
    }
    catch {
        return invalid('unreadable');
    }
}
function invalid(reason) {
    return { status: 'invalid', reason };
}
// Every part with its parent, at any depth. An attachment or an attached message is a leaf,
// so nothing inside one is read.
function entities(parent) {
    return parent.parts.flatMap((part) => attached(part) || part.mimeType === 'message/rfc822' ? [] : [[part, parent], ...entities(part)]);
}
// A designated part labelled with this profile, judged from its original header lines,
// before a parser picks one of repeated fields or parameters.
function isDesignated(part) {
    const purposes = values(part, 'content-purpose');
    if (!purposes.some((value) => value.trim().toLowerCase() === 'machine-readable'))
        return false;
    const types = values(part, 'content-type');
    return types.some((value) => value.toLowerCase().includes('application/ld+json')) && types.some((value) => value.includes(PROFILE));
}
function problem(part, parent) {
    if (!unambiguous(part))
        return 'ambiguous_headers';
    if (!TRANSFER_ENCODINGS.has(first(part, 'content-transfer-encoding').trim().toLowerCase()))
        return 'transfer_encoding';
    if (part.mimeType !== 'application/ld+json' || part.parameters.get('profile') !== PROFILE)
        return 'media_type';
    if (!partialRepresentation(parent))
        return 'not_partial_representation';
    return undefined;
}
// Each field that decides how the part is read appears once, with each parameter once.
function unambiguous(part) {
    if (!part.fields)
        return false;
    const counts = new Map();
    for (const [name] of part.fields)
        counts.set(name, (counts.get(name) ?? 0) + 1);
    return SINGLE_FIELDS.every((name) => counts.get(name) === 1) && uniqueParameters(first(part, 'content-type'));
}
// A multipart/related entity with one unambiguous Content-Type, whose root (its start
// parameter's part, or else its first) is readable.
function partialRepresentation(parent) {
    if (parent.mimeType !== 'multipart/related')
        return false;
    const types = values(parent, 'content-type');
    if (types.length !== 1 || !uniqueParameters(types[0]))
        return false;
    const start = parent.parameters.get('start') ?? '';
    const roots = start ? parent.parts.filter((part) => first(part, 'content-id').trim() === start) : parent.parts.slice(0, 1);
    return roots.length === 1 && readable(roots[0]);
}
function readable(part) {
    if (attached(part))
        return false;
    if (part.mimeType === 'multipart/alternative')
        return part.parts.some(readable);
    return READABLE.has(part.mimeType) && binary(decoded(part)).trim().length > 0;
}
function attached(part) {
    return first(part, 'content-disposition').trim().toLowerCase().startsWith('attachment');
}
function values(part, name) {
    return (part.fields ?? []).filter(([field]) => field === name).map(([, value]) => value);
}
function first(part, name) {
    return values(part, name)[0] ?? '';
}
// One entity from its raw bytes (a binary string, one character per byte): its header,
// Content-Type and, for a multipart entity, its parts.
function entity(raw) {
    const fields = headerFields(raw);
    const body = split(raw)?.[1] ?? '';
    const contentType = (fields ?? []).find(([name]) => name === 'content-type')?.[1] ?? 'text/plain';
    const [type, ...rest] = segments(contentType) ?? [contentType];
    const mimeType = type.trim().toLowerCase();
    const parameters = new Map();
    for (const segment of rest) {
        const name = PARAMETER.exec(segment)?.[1];
        if (!name)
            continue;
        const key = name.toLowerCase();
        if (!parameters.has(key))
            parameters.set(key, unquote(segment.slice(segment.indexOf('=') + 1).trim()));
    }
    const boundary = parameters.get('boundary');
    const parts = mimeType.startsWith('multipart/') && boundary ? multipart(body, boundary).map(entity) : [];
    return { fields, mimeType, parameters, body, parts };
}
// The raw bytes of each body part between the boundary's delimiter lines; the preamble and
// epilogue are not parts.
function multipart(body, boundary) {
    const delimiter = `--${boundary}`;
    const parts = [];
    let current = null;
    // The line break before a delimiter line belongs to the delimiter, not to the part.
    const close = () => {
        if (current)
            parts.push(current.join('').replace(/\r?\n$/, ''));
    };
    for (const line of body.split(/(?<=\n)/)) {
        const content = line.replace(/\r?\n$/, '').replace(/[ \t]+$/, '');
        if (content === `${delimiter}--`) {
            close();
            return parts;
        }
        if (content === delimiter) {
            close();
            current = [];
        }
        else
            current?.push(line);
    }
    close();
    return parts;
}
// An entity's header block and body, split at the first empty line; a part that begins with
// an empty line has no header fields. Null when there is no empty line.
function split(raw) {
    const leading = /^\r?\n/.exec(raw);
    if (leading)
        return ['', raw.slice(leading[0].length)];
    const separator = /\r?\n\r?\n/.exec(raw);
    return separator ? [raw.slice(0, separator.index), raw.slice(separator.index + separator[0].length)] : null;
}
// The unfolded fields of an entity's header block as [lowercase name, value] pairs, or null
// when it is malformed. Lines end with CRLF or LF.
function headerFields(raw) {
    const parts = split(raw);
    if (!parts)
        return null;
    const lines = parts[0] ? parts[0].split(/\r?\n/) : [];
    const fields = [];
    for (const line of lines) {
        if (/[\r\n]/.test(line))
            return null;
        if (line.startsWith(' ') || line.startsWith('\t')) {
            if (!fields.length)
                return null;
            fields[fields.length - 1][1] += ` ${line.trim()}`;
        }
        else {
            const match = FIELD.exec(line);
            if (!match)
                return null;
            fields.push([match[1].toLowerCase(), match[2]]);
        }
    }
    return fields;
}
// Whether every parameter of a Content-Type value has its own name. RFC 2231 sections and
// charset markers belong to the name they extend, so profile and profile* are one name.
function uniqueParameters(value) {
    const parts = segments(value);
    if (!parts)
        return false;
    const names = [];
    for (const segment of parts.slice(1)) {
        const name = PARAMETER.exec(segment)?.[1];
        if (!name)
            return false;
        names.push(name.toLowerCase().replace(/\*.*$/, ''));
    }
    return new Set(names).size === names.length;
}
// The value split at each semicolon outside a quoted string, or null when a quoted string or
// an escape is left open.
function segments(value) {
    const parts = [''];
    let quoted = false;
    let escaped = false;
    for (const char of value) {
        if (char === ';' && !quoted) {
            parts.push('');
            continue;
        }
        if (escaped)
            escaped = false;
        else if (quoted && char === '\\')
            escaped = true;
        else if (char === '"')
            quoted = !quoted;
        parts[parts.length - 1] += char;
    }
    return quoted || escaped ? null : parts;
}
function unquote(value) {
    return value.startsWith('"') && value.endsWith('"') && value.length >= 2
        ? value.slice(1, -1).replace(/\\(.)/g, '$1')
        : value;
}
// The part's body with its transfer encoding removed.
function decoded(part) {
    const encoding = first(part, 'content-transfer-encoding').trim().toLowerCase();
    if (encoding === 'base64')
        return base64(part.body);
    if (encoding === 'quoted-printable')
        return quotedPrintable(part.body);
    return bytesOf(part.body);
}
// Characters outside the alphabet are skipped, as mail readers do, so a damaged body reads as
// an invalid description rather than an unreadable message.
function base64(body) {
    let clean = body.replace(/[^A-Za-z0-9+/]/g, '');
    if (clean.length % 4 === 1)
        clean = clean.slice(0, -1);
    return bytesOf(atob(clean.padEnd(Math.ceil(clean.length / 4) * 4, '=')));
}
function quotedPrintable(body) {
    const text = body.replace(/[ \t]+(?=\r?\n)/g, '').replace(/=\r?\n/g, '');
    return bytesOf(text.replace(/=([0-9A-Fa-f]{2})/g, (_match, hex) => String.fromCharCode(parseInt(hex, 16))));
}
function binary(bytes) {
    let text = '';
    for (let index = 0; index < bytes.length; index += 0x8000)
        text += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    return text;
}
function bytesOf(text) {
    const bytes = new Uint8Array(text.length);
    for (let index = 0; index < text.length; index += 1)
        bytes[index] = text.charCodeAt(index) & 0xff;
    return bytes;
}
