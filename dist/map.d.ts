/** The MAP profile whose core artifacts this package carries. */
export declare const MAP_PROFILE = "https://mailschema.org/profiles/map/0.2";
/** A fresh copy of the MAP 0.2 core schema, as the profile record binds it by SHA-256. */
export declare function getMapSchema(): Record<string, unknown>;
/** A fresh copy of the MAP 0.2 JSON-LD context. */
export declare function getMapContext(): Record<string, unknown>;
/** A fresh copy of the type contract format every MAP 0.2 contract follows. */
export declare function getContractFormatSchema(): Record<string, unknown>;
/** A fresh copy of the form fields block contracts pin. */
export declare function getFormsSchema(): Record<string, unknown>;
