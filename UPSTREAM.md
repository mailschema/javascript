# Release provenance

Version `0.3.1` derives from [`mailschema/mailschema@67f9544`](https://github.com/mailschema/mailschema/commit/67f95447f6f2e640af8f515d6844f58d1b1d1fa2). Its sources, tests and bundled files are prepared from that commit by `npm run packages:prepare`.

The bundled MAP 0.3 artifacts are exact copies of that commit's files and do not independently define MAP:

- profile (`dist/profile.json`): `d9481627f855c127a4f5d6ddb7f3b699f66f6475bc8672d609f5b499f83d1a0f`
- context (`dist/context.jsonld`): `a51490d1fe8af695c14ea508aad88fd0429d18564791b6b52f3ab07d5c51aab3`
- core-schema (`dist/core.schema.json`): `0ad09a6955a47e7a2c1c1eec0747a3e0b15c08a79860e90ce4e65da11983aeb3`
- contract-schema (`dist/contract.schema.json`): `86bf057529c4fd2c7f0a880825774afeed31e9f7ba1d99760858a585fe28d18d`
- implementation-schema (`dist/implementation.schema.json`): `c62acc3ebb9f384c8fba7be353ab1905b65883ac2b16b147fd98485eec643396`

The canonical artifacts live in the main MailSchema repository. This repository owns the JavaScript package and its release history.
