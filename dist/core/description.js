// A MAP description: the JSON-LD a message carries beside its readable content.
import { coreSchema, createValidator, DESCRIPTION_MAX_BYTES, schemaErrors } from "./artifacts.js";
import { InvalidDocument, parse } from "./json.js";
const validate = createValidator().compile(coreSchema);
// Whitespace, controls, bidirectional and invisible formatting characters.
const UNSAFE = /[\p{White_Space}\p{Cc}\p{Cf}]/u;
/**
 * Why the value is not a MAP 0.3 description, or no reasons. Beyond the core schema:
 * expiry follows issuance, operation identifiers are unique, and no security-sensitive
 * identifier contains whitespace, a control or a formatting character.
 */
export function descriptionErrors(value) {
    if (!validate(value))
        return schemaErrors(validate.errors);
    const errors = [];
    if (Date.parse(value.expiresAt) <= Date.parse(value.issuedAt))
        errors.push('/expiresAt: must be later than issuedAt');
    const ids = value.operations.map((operation) => operation.id);
    if (new Set(ids).size !== ids.length)
        errors.push('/operations: identifiers must be unique');
    const identifiers = [
        ['/@id', value['@id']],
        ['/type/id', value.type.id],
        ['/service/id', value.service.id],
        ['/service/tenant', value.service.tenant],
        ['/recipient', value.recipient],
        ['/subject/id', value.subject.id],
        ['/terms/id', value.terms.id],
        ['/human/url', value.human.url],
        ...value.operations.map((operation, index) => [
            `/operations/${index}/capability/url`,
            operation.capability?.url,
        ]),
    ];
    for (const [pointer, identifier] of identifiers)
        if (identifier !== undefined && UNSAFE.test(identifier))
            errors.push(`${pointer}: must not contain whitespace, controls or formatting characters`);
    return errors;
}
/** The description in the bytes or text, or InvalidDocument with every reason it is not one. */
export function parseDescription(input) {
    const value = parse(input, DESCRIPTION_MAX_BYTES);
    const errors = descriptionErrors(value);
    if (errors.length)
        throw new InvalidDocument('The value is not a MAP 0.3 description.', errors);
    return value;
}
