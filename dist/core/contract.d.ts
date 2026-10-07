import { type Description } from './description.ts';
export interface Operation {
    id: string;
    name: string;
    semantics: string;
    effects: string[];
    bindings: ('credential' | 'capability')[];
    actors: ('human' | 'agent')[];
    exactTerms: boolean;
    inputSchema: Record<string, unknown> | null;
    outcomes: Record<string, string>;
    capability?: {
        kind: CapabilityKind;
        maxLifetimeSeconds: number;
    };
}
export interface ContractDocument {
    id: string;
    version: string;
    profile: string;
    name: string;
    summary: string;
    requirements: string[];
    detailsSchema: Record<string, unknown>;
    operations: Operation[];
}
export type CapabilityKind = keyof typeof CAPABILITY_KINDS;
/** The capability binding's kinds: the exact effects each declares and its longest lifetime. */
export declare const CAPABILITY_KINDS: {
    readonly refusal: {
        readonly effects: readonly ["refusal", "state"];
        readonly maxLifetimeSeconds: 604800;
    };
    readonly 'protective-report': {
        readonly effects: readonly ["protection", "state"];
        readonly maxLifetimeSeconds: 259200;
    };
    readonly 'address-confirmation': {
        readonly effects: readonly ["assertion", "state"];
        readonly maxLifetimeSeconds: 86400;
    };
};
/** Why the value is not a MAP 0.3 type contract, or no reasons. */
export declare function contractErrors(value: unknown): string[];
/** A valid contract with its digest and compiled schemas. */
export declare class Contract {
    #private;
    readonly document: ContractDocument;
    /** `sha-256:` and the SHA-256 of the contract's RFC 8785 form. */
    readonly digest: string;
    /** The contract, or InvalidDocument with every reason the value is not one. */
    constructor(value: unknown);
    /** The contract in the bytes or text, read as MAP JSON within the contract limit. */
    static parse(input: string | Uint8Array): Contract;
    get id(): string;
    get version(): string;
    operation(id: string): Operation | undefined;
    /** Why the details do not satisfy the contract's details schema, or no reasons. */
    detailsErrors(details: unknown): string[];
    /** Why the input is not acceptable for the operation, or no reasons. */
    inputErrors(operationId: string, input: unknown): string[];
    /**
     * Why a valid description does not use this contract as it allows, or no reasons: it names
     * this contract by identifier, version and digest; it offers only declared operations; a
     * capability appears only where the contract permits one, at the service's origin and
     * within the kind's lifetime; and its details satisfy the details schema.
     */
    descriptionErrors(description: Description): string[];
}
