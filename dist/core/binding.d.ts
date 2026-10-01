import type { MapDescription } from './types.ts';
/** The Content-Type of the part that carries a description, labelled with the profile. */
export declare const DESCRIPTION_MEDIA_TYPE = "application/ld+json; profile=\"https://mailschema.org/profiles/map/0.2\"";
/**
 * Whether a designated part carries a description of this profile: its media type is
 * application/ld+json, compared case-insensitively, and its profile parameter lists the
 * profile among its space-separated URIs.
 */
export declare const isDescriptionPart: (mediaType: string, profileParameter: string | undefined) => boolean;
/** The path of an absolute URL exactly as written, with no dot segments removed and nothing decoded. */
export declare const writtenPath: (url: string) => string;
/** The possession capability: the last segment of the execution URL path, as written. */
export declare const capability: (description: MapDescription) => string;
/** The rules a possession description's capability URLs meet when it is issued. */
export declare function capabilityProblems(description: MapDescription): string[];
/**
 * Whether a Content-Type admits a request rather than a 415: the media type
 * application/json, compared case-insensitively, with no parameter other than a UTF-8
 * charset. Only HTTP's optional whitespace, spaces and tabs, may surround each part, and
 * empty parameter slots are ignored, as RFC 9110 permits.
 */
export declare function isJsonRequest(contentType: string | undefined): boolean;
/** The result resource of a request: the description's template with the identifier encoded. */
export declare const resultUrl: (description: MapDescription, requestId: string) => string;
