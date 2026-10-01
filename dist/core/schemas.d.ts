import type { JsonObject } from './types.ts';
/** Every schema object within a schema, the schema itself first. */
export declare function nodes(schema: unknown): Generator<JsonObject>;
/** Every value a keyword has in the schema objects within a schema. */
export declare const values: (schema: unknown, keyword: string) => unknown[];
/** Rules of a form fields block that JSON Schema cannot state. */
export declare function formProblems(fields: JsonObject): string[];
/**
 * The schema the values of a fields block satisfy: only its fields, each with a text
 * field's `format` read as the core lexical form of that name.
 */
export declare function fieldValuesSchema(fields: JsonObject): JsonObject;
/**
 * Why a contract's schemas would resolve anything but a pinned schema, or undefined. No
 * keyword resolves by scope, in the contract's schemas or the pinned ones it supplies. In
 * the contract's own schemas, no $id or $schema appears but at the request schema's root,
 * since it would move references or change the dialect a subschema is read in; no type is
 * a list; autocomplete, the form fields block's annotation, is absent; and every
 * reference is a string naming a schema in the pinned documents, by URL.
 */
export declare function referenceProblem(inline: unknown[], requestSchema: JsonObject, pinned: ReadonlyMap<string, JsonObject>, supplied: JsonObject[]): string | undefined;
