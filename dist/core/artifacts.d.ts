export { coreSchema, contractSchema, implementationSchema } from './bundled.ts';
export declare const PROFILE = "https://mailschema.org/profiles/map/0.3";
export declare const CONTEXT = "https://mailschema.org/contexts/map-0.3.jsonld";
/** The Content-Type of the MIME part that carries a description. */
export declare const DESCRIPTION_MEDIA_TYPE = "application/ld+json; profile=\"https://mailschema.org/profiles/map/0.3\"";
export declare const DESCRIPTION_MAX_BYTES = 65536;
export declare const CONTRACT_MAX_BYTES = 262144;
/** The namespace of the initial effect vocabulary. */
export declare const EFFECTS = "https://mailschema.org/effects/";
/** The formats MAP schemas may assert. Every implementation checks exactly these. */
export declare const FORMATS: readonly ["date", "date-time", "email", "uri"];
