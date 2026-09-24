export { contributionErrors, assertContribution, assertTypeRecord, referenceErrors, } from './validation.js';
export type { CatalogView } from './validation.js';
export { typeStages } from './model.js';
export type { Party, TypeDefinition, TypeRecord, Contribution, Implementation } from './model.js';
export { mapErrors, assertMapDocument, contentReviewRequestErrors, assertContentReviewRequest, getMapSchema, getContentReviewSchema, getContentReviewContract, } from './map.js';
/** Return an independent copy of the contribution JSON Schema (Draft 2020-12). */
export declare function getContributionSchema(): Record<string, unknown>;
/** Return the schema for an expanded Registry record, including attribution and history. */
export declare function getRecordSchema(): Record<string, unknown>;
