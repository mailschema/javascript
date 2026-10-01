export declare const escape: (name: string) => string;
export declare const segments: (pointer: string) => string[];
export declare const codePoints: (text: string) => number;
/** The pointer, or its nearest ancestor no longer than limit code points. */
export declare function within(pointer: string, limit: number): string;
/** The value a pointer names through objects and arrays, or undefined. */
export declare function resolve(value: unknown, pointer: string): unknown;
/**
 * The value a pointer names through object members only, or undefined. The contract
 * rules bind form fields only through object properties, so no binding indexes an array.
 */
export declare function member(value: unknown, pointer: string): unknown;
