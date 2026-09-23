import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import schema from './contribution.schema.json' with { type: 'json' };
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
addFormats(ajv);
const contribution = ajv.compile(schema);
const variants = new Map(schema.oneOf.map((variant) => [
    variant.properties.kind.const,
    ajv.compile({ $schema: schema.$schema, $defs: schema.$defs, ...variant }),
]));
const record = ajv.compile({
    $schema: schema.$schema,
    $defs: schema.$defs,
    $ref: '#/$defs/record',
});
export function contributionErrors(value) {
    const kind = value && typeof value === 'object' && 'kind' in value ? value.kind : undefined;
    const validate = typeof kind === 'string' ? variants.get(kind) || contribution : contribution;
    if (validate(value))
        return [];
    return (validate.errors || []).map((error) => `${error.instancePath || '/'} ${error.message}${error.keyword === 'required' ? `: ${error.params.missingProperty}` : ''}`);
}
export function assertContribution(value) {
    const errors = contributionErrors(value);
    if (errors.length)
        throw new Error(`Invalid contribution:\n${errors.join('\n')}`);
}
export function assertTypeRecord(value) {
    if (!record(value))
        throw new Error(`Invalid type record: ${ajv.errorsText(record.errors, { separator: '\n' })}`);
}
export function referenceErrors(input, catalog) {
    const errors = [];
    if (input.kind === 'implementation') {
        const target = catalog.snapshots.find((item) => item.digest === input.typeDigest)?.record;
        if (!target || target.slug !== input.type || target.version !== input.typeVersion)
            return [
                'Unknown type version or record digest. Download the current record from the Registry.',
            ];
        if (target.profile !== input.profile)
            errors.push('Execution profile does not match the targeted record.');
        const operations = new Set(target.operations.map((operation) => operation.id));
        if (new Set(input.operations).size !== input.operations.length ||
            input.operations.some((operation) => !operations.has(operation)))
            errors.push('Unknown or duplicate operation in the implementation declaration.');
    }
    else {
        const existing = catalog.types.find((item) => item.record.slug === input.record.slug);
        if (input.kind === 'new-type' && existing)
            errors.push('This type already exists. Submit an amendment instead.');
        if (input.kind === 'amendment' && (!existing || existing.digest !== input.baseDigest))
            errors.push('Stale or unknown amendment base. Download the current record and reconcile your changes.');
        if (catalog.types.some((item) => item.record.slug !== input.record.slug &&
            item.record.name.toLocaleLowerCase() === input.record.name.toLocaleLowerCase()))
            errors.push('Another type already uses this name.');
        const operationIds = input.record.operations.map((operation) => operation.id);
        const operationNames = input.record.operations.map((operation) => operation.name.toLocaleLowerCase());
        if (new Set(operationIds).size !== operationIds.length)
            errors.push('Operation identifiers must be unique within a type.');
        if (new Set(operationNames).size !== operationNames.length)
            errors.push('Operation names must be unique within a type.');
    }
    return errors;
}
