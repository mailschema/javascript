import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import mapSchema from './map-0.1.schema.json' with { type: 'json' };
import contentReviewSchema from './content-review-0.1.schema.json' with { type: 'json' };
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: false });
addFormats(ajv);
const mapDocument = ajv.compile(mapSchema);
const contentReviewRequest = ajv.compile(contentReviewSchema);
function errors(validate, value) {
    if (validate(value))
        return [];
    return (validate.errors || []).map((error) => `${error.instancePath || '/'} ${error.message}${error.keyword === 'required' ? `: ${error.params.missingProperty}` : ''}`);
}
export function mapErrors(value) {
    return errors(mapDocument, value);
}
export function assertMapDocument(value) {
    const found = mapErrors(value);
    if (found.length)
        throw new Error(`Invalid MAP 0.1 document:\n${found.join('\n')}`);
}
export function contentReviewRequestErrors(value) {
    return errors(contentReviewRequest, value);
}
export function assertContentReviewRequest(value) {
    const found = contentReviewRequestErrors(value);
    if (found.length)
        throw new Error(`Invalid Content Review 0.1 request:\n${found.join('\n')}`);
}
export function getMapSchema() {
    return structuredClone(mapSchema);
}
export function getContentReviewSchema() {
    return structuredClone(contentReviewSchema);
}
