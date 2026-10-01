// Mail Action Protocol 0.2 processing. It parses, canonicalizes, digests and validates MAP
// documents, checks the type contracts an implementation vendors, and builds results and
// problems. It does not establish endpoint trust, verify email authentication, grant
// authority or send email.
export { MAP_PROFILE, CORE_SCHEMA, FORMS_SCHEMA, CONTRACT_FORMAT, CONTEXT, mapErrors, descriptionErrors, requestErrors, resultErrors, problemErrors, isRequestId, reached, } from "./artifacts.js";
export { InvalidDocument, parse, canonicalize, digest } from "./document.js";
export { APPROVAL_REASONS, Contract, InvalidContract } from "./contract.js";
export { PROBLEM_STATUS, result, transition, problem, resultStatus, retainUntil, settle, } from "./documents.js";
export { DESCRIPTION_MEDIA_TYPE, isDescriptionPart, capability, writtenPath, isJsonRequest, resultUrl, } from "./binding.js";
