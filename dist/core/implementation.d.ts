export interface ImplementationRecord {
    service: string;
    maintainer: {
        name: string;
        url: string;
    };
    type: {
        id: string;
        version: string;
        contractDigest: string;
    };
    operations: string[];
    binding: string;
    artifact?: {
        url: string;
        digest: string;
        digestMode: 'canonical-json' | 'bytes';
    };
    format?: string;
    status: 'Draft' | 'Experimental' | 'Stable' | 'Deprecated' | 'Superseded';
    documentation: string;
    evidence: {
        kind: 'declaration' | 'test-report';
        url: string;
        summary: string;
    }[];
    successor?: string;
}
/** Why the value is not an implementation record, or no reasons. */
export declare function implementationErrors(value: unknown): string[];
/** The record in the bytes or text, or InvalidDocument with every reason it is not one. */
export declare function parseImplementation(input: string | Uint8Array): ImplementationRecord;
