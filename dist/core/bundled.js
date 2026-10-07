// The schemas the 0.3 profile record binds, by their canonical files. Package preparation
// points these three imports at the package's own copies; no other line differs between the
// repository and the npm package.
import coreSchema from '../core.schema.json' with { type: 'json' };
import contractSchema from '../contract.schema.json' with { type: 'json' };
import implementationSchema from '../implementation.schema.json' with { type: 'json' };
export { coreSchema, contractSchema, implementationSchema };
