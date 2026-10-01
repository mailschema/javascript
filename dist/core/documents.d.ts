import type { InputError, JsonObject, MapDescription, MapProblem, MapRequest, MapResult, ResultState, Target } from './types.ts';
/** The HTTP status of every MAP problem code, as the core schema fixes it. */
export declare const PROBLEM_STATUS: {
    readonly 'invalid-request': 400;
    readonly 'authentication-required': 401;
    readonly refused: 403;
    readonly 'result-not-found': 404;
    readonly 'stale-target': 409;
    readonly 'idempotency-conflict': 409;
    readonly 'request-in-progress': 409;
    readonly 'already-decided': 409;
    readonly 'expired-interaction': 410;
    readonly 'unsupported-type': 422;
    readonly 'unsupported-operation': 422;
};
export type ProblemCode = keyof typeof PROBLEM_STATUS;
/**
 * A result for a request, with every correlation member. `approvalUrl` is given exactly for
 * approval-required and `reason` exactly for failed. Like every builder here, it throws
 * rather than return a document the core refuses.
 */
export declare function result(request: MapRequest, { state, target, resultUrl, recordedAt, output, reason, approvalUrl, actor, }: {
    state: ResultState;
    target: Target;
    resultUrl: string;
    recordedAt: Date;
    output?: JsonObject;
    reason?: string;
    approvalUrl?: string;
    actor?: string;
}): MapResult;
/**
 * The next state of a pending or approval-required result. Every correlation member and the
 * actor stay; the state, reason, output and recording time change.
 */
export declare function transition(previous: MapResult, { state, recordedAt, reason, output, }: {
    state: ResultState;
    recordedAt: Date;
    reason?: string;
    output?: JsonObject;
}): MapResult;
/**
 * A problem. With `requestId` it is correlated and carries `instance`, `profile`,
 * `requestId`, `interactionId` and `code`; without, it is plain RFC 9457. It stays within
 * the core limits: a long detail is cut, each input error is bounded, and only as many of
 * the first 100 errors as fit within 64 KiB are kept.
 */
export declare function problem(code: ProblemCode, { title, detail, requestId, interactionId, resultUrl, target, errors, }: {
    title: string;
    detail: string;
    requestId?: string;
    interactionId?: string;
    resultUrl?: string;
    target?: Target;
    errors?: InputError[];
}): MapProblem;
/** The HTTP status of a result: 202 while work is pending, otherwise 200. */
export declare const resultStatus: (document: MapResult) => 200 | 202;
/**
 * Results stay retrievable until the later of the interaction's expiry and the retention
 * interval measured from the latest recorded state.
 */
export declare const retainUntil: (description: MapDescription, recordedAt: Date) => Date;
/**
 * An undecided approval ends as failed, with reason expired, at the interaction's expiry,
 * whether or not anyone looks. The settled result, or undefined when nothing changes.
 */
export declare function settle(document: MapResult, description: MapDescription, now: Date): MapResult | undefined;
