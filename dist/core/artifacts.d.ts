import { type ErrorObject, type ValidateFunction } from 'ajv/dist/2020.js';
import type { JsonObject } from './types.ts';
export declare const MAP_PROFILE = "https://mailschema.org/profiles/map/0.2";
export declare const CORE_SCHEMA = "https://mailschema.org/schemas/map-0.2.schema.json";
export declare const FORMS_SCHEMA = "https://mailschema.org/schemas/forms-0.1.schema.json";
export declare const CONTRACT_FORMAT = "https://mailschema.org/schemas/type-contract-0.2.schema.json";
export declare const CONTEXT = "https://mailschema.org/contexts/map-0.2.jsonld";
export declare const JSON_SCHEMA_2020_12 = "https://json-schema.org/draft/2020-12/schema";
/** The schemas a contract may depend on without supplying them itself. */
export declare const BUNDLED: ReadonlyMap<string, JsonObject>;
/** A core or form fields definition by name, for the shared lexical vectors. */
export declare const definition: (schema: string, name: string) => ValidateFunction;
/** Errors as `pointer message` lines, as the other MailSchema packages report them. */
export declare function errorList(errors: ErrorObject[] | null | undefined, prefix?: string): string[];
/** Checks a type contract against the contract format. */
export declare const contractFormatErrors: (contract: unknown) => string[];
/** Checks any MAP 0.2 description, request, result or problem against the core schema. */
export declare const mapErrors: (document: unknown) => string[];
/**
 * Checks a description against the core description definition only. A description of a
 * type the caller has no contract for can be checked this far.
 */
export declare const descriptionErrors: (description: unknown) => string[];
/** Checks a request against the core request definition. Its identifier stays free if it fails. */
export declare const requestErrors: (request: unknown) => string[];
/** Checks a result against the core result definition only. */
export declare const resultErrors: (result: unknown) => string[];
/** Checks a problem against the core problem definition, including its type, status and code. */
export declare const problemErrors: (problem: unknown) => string[];
/** Whether a value is a request identifier: the core UUID URN form. Only one names a result resource. */
export declare const isRequestId: (value: unknown) => boolean;
/**
 * Whether a deadline, a core date-time plus `afterSeconds`, has been reached. Anything but
 * a core date-time counts as reached, so a mistake fails closed.
 */
export declare const reached: (now: Date, deadline: string, afterSeconds?: number) => boolean;
