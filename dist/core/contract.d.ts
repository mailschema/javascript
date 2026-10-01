import type { ProblemCode } from './documents.ts';
import type { InputError, JsonObject, MapDescription, MapRequest, TypeContract, TypeReference } from './types.ts';
/** A type contract that fails its own checks or its pinned digest. */
export declare class InvalidContract extends Error {
}
/** Reasons the core assigns to the approval lifecycle. */
export declare const APPROVAL_REASONS: readonly ["declined", "stale-target", "expired", "superseded"];
/** A MAP problem a request earns before the service's own state is consulted. */
export type RequestProblem = {
    code: ProblemCode;
    title: string;
    detail: string;
};
/**
 * A type contract an implementation vendors, verified against the digest it was pinned by
 * and compiled once. It checks the descriptions, requests, inputs and results of that exact
 * type. The Registry has already applied the contract rules, such as portable patterns, to
 * the contract that digest names; loading refuses anything that would otherwise fail when a
 * request arrives.
 */
export declare class Contract {
    #private;
    readonly document: TypeContract;
    readonly digest: string;
    readonly requestSchema: JsonObject;
    /**
     * `digest` is the contract digest the implementation pinned; `dependencies` supplies, by
     * URL, any pinned schema the package does not bundle.
     */
    constructor(contract: unknown, requestSchema: unknown, { digest: pinned, dependencies, }: {
        digest: string;
        dependencies?: Record<string, unknown>;
    });
    get id(): string;
    get version(): string;
    /** The type reference a description and a request of this contract name exactly. */
    get typeReference(): TypeReference;
    operation(id: string): import("./types.ts").ContractOperation | undefined;
    /** Whether completing the operation decides the interaction. */
    isDecision(id: string): boolean;
    /**
     * Every rule a description must satisfy beyond the core schema, for the service that issues
     * it and the client that receives it.
     */
    descriptionErrors(description: unknown): string[];
    /**
     * The checks a service makes on a request once it has resolved the description it issued,
     * compared the description digest and established the caller: the exact type, an offered
     * operation the authority permits, and expiry. Undefined when they pass. The service then
     * applies its own state (a decided interaction, a stale target) and `inputErrors`, in that
     * order, before any effect.
     */
    requestProblem(description: MapDescription, request: MapRequest, { now }: {
        now: Date;
    }): RequestProblem | undefined;
    /**
     * Input problems for one request, each with a detail and a JSON Pointer into its input: the
     * operation's input schema, then its field bindings against the description's details. Type
     * rules a contract cannot express are the caller's.
     */
    inputErrors(description: MapDescription, request: MapRequest): InputError[];
    /** A request against the core request definition and this contract's request schema. */
    requestErrors(request: unknown): string[];
    /** The core result definition, then the output schema and reason the operation declares. */
    resultErrors(result: unknown): string[];
}
