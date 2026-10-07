/**
 * Why a pattern is outside the portable subset, or undefined. The subset is printable ASCII
 * text, with any other code point written as \uXXXX. It has literal characters and escaped
 * syntax characters; \t, \n, \f, \r and \d, the ASCII digits; non-empty classes of literal or
 * escaped members and ranges, with a literal hyphen only first or last; (?: groups;
 * alternation; ^ and $; and one *, +, ?, {n}, {n,} or {n,m} after an atom. Other class
 * escapes and the dot match different characters in different engines, and brackets, && or a
 * stray brace inside a class, or a quantifier on a quantifier, are read differently or refused
 * by one of them. ^ and $ anchor the whole value, as in ECMA-262; an engine whose anchors also
 * match at line breaks must read them so.
 */
export declare function unportablePattern(pattern: string): string | undefined;
