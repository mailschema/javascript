// The core artifacts, by their canonical files. Package preparation points these three
// imports at the package's own copies; no other line differs between the repository and
// the npm package.
import coreSchema from '../map-0.2.schema.json' with { type: 'json' };
import formsSchema from '../forms-0.1.schema.json' with { type: 'json' };
import contractFormat from '../type-contract-0.2.schema.json' with { type: 'json' };

export { coreSchema, formsSchema, contractFormat };
