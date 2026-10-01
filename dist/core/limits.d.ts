import type { InputError, JsonObject } from './types.ts';
/** The text, or its first limit - 1 code points and an ellipsis. */
export declare const cut: (text: string, limit: number) => string;
/**
 * An input error within the core problem's limits. A pointer too long to report names its
 * nearest ancestor that fits, with a detail that says so, and a detail too long is cut.
 */
export declare function inputError(detail: string, pointer: string): InputError;
/**
 * A problem's title, detail and input errors within the core limits. An empty or overlong
 * title, an empty detail or an empty error list is the caller's mistake.
 */
export declare function problemMembers(title: string, detail: string, errors?: InputError[]): {
    title: string;
    detail: string;
    errors: InputError[] | undefined;
};
/** The problem with as many of its errors, in order, as fit within the document limit. */
export declare function withinDocument(problem: JsonObject): JsonObject;
