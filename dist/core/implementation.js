// An implementation record: a Registry declaration or report of a service's support for exact
// contract versions.
import { CONTRACT_MAX_BYTES, createValidator, implementationSchema, schemaErrors, } from "./artifacts.js";
import { InvalidDocument, parse } from "./json.js";
const validate = createValidator().compile(implementationSchema);
/** Why the value is not an implementation record, or no reasons. */
export function implementationErrors(value) {
    if (!validate(value))
        return schemaErrors(validate.errors);
    const errors = [];
    const { origin } = new URL(value.service);
    if (value.service !== origin && value.service !== `${origin}/`)
        errors.push('/service: must be an HTTPS origin, not an operation path');
    if (new Set(value.operations).size !== value.operations.length)
        errors.push('/operations: identifiers must be unique');
    return errors;
}
/** The record in the bytes or text, or InvalidDocument with every reason it is not one. */
export function parseImplementation(input) {
    const value = parse(input, CONTRACT_MAX_BYTES);
    const errors = implementationErrors(value);
    if (errors.length)
        throw new InvalidDocument('The value is not an implementation record.', errors);
    return value;
}
