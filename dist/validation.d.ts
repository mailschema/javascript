import type { Contribution, TypeRecord } from './model.js';
export declare function contributionErrors(value: unknown): string[];
export declare function assertContribution(value: unknown): asserts value is Contribution;
export declare function assertTypeRecord(value: unknown): asserts value is TypeRecord;
export interface CatalogView {
    types: {
        record: TypeRecord;
        digest: string;
    }[];
    snapshots: {
        record: TypeRecord;
        digest: string;
    }[];
}
export declare function referenceErrors(input: Contribution, catalog: CatalogView): string[];
