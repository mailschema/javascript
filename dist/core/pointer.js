// JSON Pointer (RFC 6901). Undefined stands for "nothing there", which no JSON value is.
const INDEX = /^(?:0|[1-9][0-9]*)$/;
export const escape = (name) => name.replaceAll('~', '~0').replaceAll('/', '~1');
export const segments = (pointer) => pointer
    .split('/')
    .slice(1)
    .map((segment) => segment.replaceAll('~1', '/').replaceAll('~0', '~'));
// Lengths as JSON Schema counts them: in code points, not UTF-16 code units.
export const codePoints = (text) => [...text].length;
/** The pointer, or its nearest ancestor no longer than limit code points. */
export function within(pointer, limit) {
    const tokens = pointer.split('/');
    while (codePoints(tokens.join('/')) > limit)
        tokens.pop();
    return tokens.join('/');
}
/** The value a pointer names through objects and arrays, or undefined. */
export function resolve(value, pointer) {
    let current = value;
    for (const name of segments(pointer)) {
        if (Array.isArray(current)) {
            if (!INDEX.test(name) || Number(name) >= current.length)
                return undefined;
            current = current[Number(name)];
        }
        else if (current && typeof current === 'object' && Object.hasOwn(current, name))
            current = current[name];
        else
            return undefined;
    }
    return current;
}
/**
 * The value a pointer names through object members only, or undefined. The contract
 * rules bind form fields only through object properties, so no binding indexes an array.
 */
export function member(value, pointer) {
    let current = value;
    for (const name of segments(pointer)) {
        if (!current ||
            typeof current !== 'object' ||
            Array.isArray(current) ||
            !Object.hasOwn(current, name))
            return undefined;
        current = current[name];
    }
    return current;
}
