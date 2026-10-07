// Mail Action Protocol 0.3 processing: one implementation, run unchanged by the repository's
// site and checks and shipped as the npm package.
export { PROFILE, CONTEXT, DESCRIPTION_MEDIA_TYPE, DESCRIPTION_MAX_BYTES, CONTRACT_MAX_BYTES, EFFECTS, FORMATS, coreSchema, contractSchema, implementationSchema, } from "./artifacts.js";
export { InvalidDocument, MAX_DEPTH, decodeUtf8, parse, canonicalize, digest } from "./json.js";
export { sha256 } from "./sha256.js";
export { descriptionErrors, parseDescription } from "./description.js";
export { CAPABILITY_KINDS, Contract, contractErrors, } from "./contract.js";
export { implementationErrors, parseImplementation, } from "./implementation.js";
export { unportablePattern } from "./patterns.js";
