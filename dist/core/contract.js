import { CONTRACT_MAX_BYTES, contractSchema, createValidator, EFFECTS, FORMATS, schemaErrors, } from "./artifacts.js";
import { descriptionErrors } from "./description.js";
import { digest, InvalidDocument, parse } from "./json.js";
import { unportablePattern } from "./patterns.js";
/** The capability binding's kinds: the exact effects each declares and its longest lifetime. */
export const CAPABILITY_KINDS = {
    refusal: { effects: ['refusal', 'state'], maxLifetimeSeconds: 604800 },
    'protective-report': { effects: ['protection', 'state'], maxLifetimeSeconds: 259200 },
    'address-confirmation': { effects: ['assertion', 'state'], maxLifetimeSeconds: 86400 },
};
// The JSON Schema 2020-12 keywords a contract's schemas may use. Every implementation
// enforces all of them alike; scope-resolved references and content annotations are absent.
const KEYWORDS = new Set([
    '$schema', '$ref', '$defs', '$comment',
    'allOf', 'anyOf', 'oneOf', 'not', 'if', 'then', 'else', 'dependentSchemas',
    'prefixItems', 'items', 'contains', 'properties', 'patternProperties',
    'additionalProperties', 'propertyNames', 'unevaluatedItems', 'unevaluatedProperties',
    'type', 'enum', 'const', 'multipleOf', 'maximum', 'exclusiveMaximum', 'minimum',
    'exclusiveMinimum', 'maxLength', 'minLength', 'pattern', 'maxItems', 'minItems',
    'uniqueItems', 'maxContains', 'minContains', 'maxProperties', 'minProperties', 'required',
    'dependentRequired', 'format',
    'title', 'description', 'default', 'deprecated', 'readOnly', 'writeOnly', 'examples',
]); // prettier-ignore
const SCHEMA = ['additionalProperties', 'propertyNames', 'items', 'contains', 'not', 'if', 'then', 'else', 'unevaluatedItems', 'unevaluatedProperties']; // prettier-ignore
const SCHEMA_LISTS = ['allOf', 'anyOf', 'oneOf', 'prefixItems'];
const SCHEMA_MAPS = ['properties', 'patternProperties', '$defs', 'dependentSchemas'];
const DIALECT = 'https://json-schema.org/draft/2020-12/schema';
// The keywords that apply their subschemas to the value itself, not to a member or item.
const IN_PLACE = new Set(['not', 'if', 'then', 'else', 'allOf', 'anyOf', 'oneOf', 'dependentSchemas']);
const escape = (name) => name.replaceAll('~', '~0').replaceAll('/', '~1');
/** The values a schema object holds where schemas belong, as [keyword, pointer, value]. */
function children(node, pointer) {
    const found = [];
    for (const keyword of SCHEMA)
        if (Object.hasOwn(node, keyword))
            found.push([keyword, `${pointer}/${keyword}`, node[keyword]]);
    for (const keyword of SCHEMA_LISTS)
        if (Array.isArray(node[keyword]))
            for (const [index, item] of node[keyword].entries())
                found.push([keyword, `${pointer}/${keyword}/${index}`, item]);
    for (const keyword of SCHEMA_MAPS) {
        const map = node[keyword];
        if (map && typeof map === 'object' && !Array.isArray(map))
            for (const [name, item] of Object.entries(map))
                found.push([keyword, `${pointer}/${keyword}/${escape(name)}`, item]);
    }
    return found;
}
const isObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);
/**
 * Every schema within a schema, object or boolean, with its JSON Pointer from the root, the
 * schema itself first.
 */
function* schemas(schema, pointer) {
    if (typeof schema === 'boolean')
        yield [pointer, schema];
    if (!isObject(schema))
        return;
    yield [pointer, schema];
    for (const [, at, item] of children(schema, pointer))
        yield* schemas(item, at);
}
/**
 * Whether applying the schema can never finish: from its root, a chain of $ref and in-place
 * keywords returns to a schema without moving into a member or item.
 */
function endless(schema) {
    // Where each schema object sends its value, and whether it is the same value.
    const links = new Map();
    for (const [at, node] of schemas(schema, '')) {
        if (!isObject(node))
            continue;
        const applied = children(node, at)
            .filter(([keyword]) => keyword !== '$defs')
            .map(([keyword, to]) => [to, IN_PLACE.has(keyword)]);
        if (typeof node.$ref === 'string')
            applied.push([node.$ref.slice(1), true]);
        links.set(at, applied);
    }
    const reachable = [''];
    for (const at of reachable)
        for (const [to] of links.get(at) ?? [])
            if (!reachable.includes(to))
                reachable.push(to);
    const state = new Map();
    const loops = (at) => {
        if (state.has(at))
            return state.get(at) === 'open';
        state.set(at, 'open');
        const looped = (links.get(at) ?? []).some(([to, inPlace]) => inPlace && loops(to));
        state.set(at, 'done');
        return looped;
    };
    return reachable.some(loops);
}
/** Why a schema a contract supplies cannot be enforced alike everywhere, if it cannot. */
function schemaProblems(schema, pointer) {
    const problems = [];
    const positions = new Set([...schemas(schema, '')].map(([at]) => at));
    for (const [at, value] of schemas(schema, pointer)) {
        if (typeof value === 'boolean')
            continue;
        const node = value;
        for (const keyword of Object.keys(node))
            if (!KEYWORDS.has(keyword))
                problems.push(`${at}: ${keyword} is not a MAP schema keyword`);
        if ('$schema' in node && (at !== pointer || node.$schema !== DIALECT))
            problems.push(`${at}: $schema names JSON Schema 2020-12, at the schema's root only`);
        const ref = node.$ref;
        if (ref !== undefined &&
            (typeof ref !== 'string' || !ref.startsWith('#') || !positions.has(ref.slice(1))))
            problems.push(`${at}: $ref is a JSON Pointer to a schema within this schema`);
        if ('format' in node && !FORMATS.includes(node.format))
            problems.push(`${at}: format is one of ${FORMATS.join(', ')}`);
        if (typeof node.multipleOf === 'number' && !Number.isInteger(node.multipleOf))
            problems.push(`${at}: multipleOf is an integer`);
        const patterns = [
            ...(typeof node.pattern === 'string' ? [node.pattern] : []),
            ...Object.keys(node.patternProperties ?? {}),
        ];
        for (const pattern of patterns) {
            const problem = unportablePattern(pattern);
            if (problem)
                problems.push(`${at}: pattern ${JSON.stringify(pattern)} uses ${problem}`);
        }
    }
    if (problems.length)
        return problems;
    if (endless(schema))
        return [`${pointer}: $ref leads back without moving into the value`];
    try {
        createValidator().compile(schema);
    }
    catch (error) {
        problems.push(`${pointer}: ${error.message}`);
    }
    return problems;
}
const validateContract = createValidator().compile(contractSchema);
/** An HTTPS URL's host and port as an origin compares them: lowercase, without :443. */
const authority = (url) => /^https:\/\/([^/?#]*)/i.exec(url)?.[1].toLowerCase().replace(/:443$/, '');
/** Why the value is not a MAP 0.3 type contract, or no reasons. */
export function contractErrors(value) {
    if (!validateContract(value))
        return schemaErrors(validateContract.errors);
    const errors = [];
    if (new TextEncoder().encode(JSON.stringify(value)).length > CONTRACT_MAX_BYTES)
        errors.push(`/: exceeds ${CONTRACT_MAX_BYTES} bytes`);
    const ids = value.operations.map((operation) => operation.id);
    if (new Set(ids).size !== ids.length)
        errors.push('/operations: identifiers must be unique');
    errors.push(...schemaProblems(value.detailsSchema, '/detailsSchema'));
    for (const [index, operation] of value.operations.entries()) {
        const at = `/operations/${index}`;
        if (operation.inputSchema)
            errors.push(...schemaProblems(operation.inputSchema, `${at}/inputSchema`));
        if (!operation.capability)
            continue;
        const kind = CAPABILITY_KINDS[operation.capability.kind];
        const expected = kind.effects.map((effect) => `${EFFECTS}${effect}`).sort();
        if (operation.effects.toSorted().join('\n') !== expected.join('\n'))
            errors.push(`${at}/effects: a ${operation.capability.kind} capability declares exactly ${expected.join(' and ')}`);
        if (operation.capability.maxLifetimeSeconds > kind.maxLifetimeSeconds)
            errors.push(`${at}/capability/maxLifetimeSeconds: at most ${kind.maxLifetimeSeconds}`);
    }
    return errors;
}
/** A valid contract with its digest and compiled schemas. */
export class Contract {
    document;
    /** `sha-256:` and the SHA-256 of the contract's RFC 8785 form. */
    digest;
    #details;
    #inputs = new Map();
    /** The contract, or InvalidDocument with every reason the value is not one. */
    constructor(value) {
        const errors = contractErrors(value);
        if (errors.length)
            throw new InvalidDocument('The value is not a MAP 0.3 type contract.', errors);
        this.document = structuredClone(value);
        this.digest = digest(this.document);
        const ajv = createValidator();
        this.#details = ajv.compile(this.document.detailsSchema);
        for (const operation of this.document.operations)
            if (operation.inputSchema)
                this.#inputs.set(operation.id, ajv.compile(operation.inputSchema));
    }
    /** The contract in the bytes or text, read as MAP JSON within the contract limit. */
    static parse(input) {
        return new Contract(parse(input, CONTRACT_MAX_BYTES));
    }
    get id() {
        return this.document.id;
    }
    get version() {
        return this.document.version;
    }
    operation(id) {
        return this.document.operations.find((operation) => operation.id === id);
    }
    /** Why the details do not satisfy the contract's details schema, or no reasons. */
    detailsErrors(details) {
        return this.#details(details) ? [] : schemaErrors(this.#details.errors, '/details');
    }
    /** Why the input is not acceptable for the operation, or no reasons. */
    inputErrors(operationId, input) {
        const operation = this.operation(operationId);
        if (!operation)
            return [`/operation: ${operationId} is not an operation of this contract`];
        const validate = this.#inputs.get(operationId);
        if (!validate)
            return input === undefined ? [] : ['/input: this operation accepts no input'];
        return validate(input) ? [] : schemaErrors(validate.errors, '/input');
    }
    /**
     * Why a valid description does not use this contract as it allows, or no reasons: it names
     * this contract by identifier, version and digest; it offers only declared operations; a
     * capability appears only where the contract permits one, at the service's origin and
     * within the kind's lifetime; and its details satisfy the details schema.
     */
    descriptionErrors(description) {
        const invalid = descriptionErrors(description);
        if (invalid.length)
            return invalid;
        const errors = [];
        const { type } = description;
        if (type.id !== this.id || type.version !== this.version)
            errors.push(`/type: names ${type.id} ${type.version}, not this contract`);
        if (type.contractDigest !== this.digest)
            errors.push('/type/contractDigest: does not match');
        if (description.profile !== this.document.profile)
            errors.push('/profile: differs from the contract profile');
        const lifetime = (Date.parse(description.expiresAt) - Date.parse(description.issuedAt)) / 1000;
        const origin = authority(description.service.id);
        for (const [index, offered] of description.operations.entries()) {
            const at = `/operations/${index}`;
            const operation = this.operation(offered.id);
            if (!operation) {
                errors.push(`${at}/id: ${offered.id} is not an operation of this contract`);
                continue;
            }
            if (!offered.capability)
                continue;
            if (!operation.capability)
                errors.push(`${at}/capability: the contract permits no capability for ${offered.id}`);
            else if (lifetime > operation.capability.maxLifetimeSeconds)
                errors.push(`/expiresAt: a ${offered.id} capability lasts at most ${operation.capability.maxLifetimeSeconds} seconds`);
            if (authority(offered.capability.url) !== origin)
                errors.push(`${at}/capability/url: must have the service's origin`);
        }
        return [...errors, ...this.detailsErrors(description.details)];
    }
}
