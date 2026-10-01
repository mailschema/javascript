import { readFileSync } from 'node:fs';
const artifact = (name) => JSON.parse(readFileSync(new URL(`./${name}`, import.meta.url), 'utf8'));
/** A fresh copy of the MAP 0.2 core schema, as the profile record binds it by SHA-256. */
export function getMapSchema() {
    return artifact('map-0.2.schema.json');
}
/** A fresh copy of the MAP 0.2 JSON-LD context. */
export function getMapContext() {
    return artifact('map-0.2.jsonld');
}
/** A fresh copy of the type contract format every MAP 0.2 contract follows. */
export function getContractFormatSchema() {
    return artifact('type-contract-0.2.schema.json');
}
/** A fresh copy of the form fields block contracts pin. */
export function getFormsSchema() {
    return artifact('forms-0.1.schema.json');
}
