/**
 * Mail Action Protocol 0.2 processing and core artifacts, and validation tools for MailSchema
 * Registry contributions.
 */
import schema from './contribution.schema.json' with { type: 'json' };
export * from './core/index.js';
export { contributionErrors, assertContribution, assertTypeRecord, referenceErrors, } from './validation.js';
export { typeStages } from './model.js';
export { getMapSchema, getMapContext, getContractFormatSchema, getFormsSchema } from './map.js';
/** Return an independent copy of the contribution JSON Schema (Draft 2020-12). */
export function getContributionSchema() {
    return structuredClone(schema);
}
/** Return the schema for an expanded Registry record, including attribution and history. */
export function getRecordSchema() {
    return { $schema: schema.$schema, $defs: structuredClone(schema.$defs), $ref: '#/$defs/record' };
}
