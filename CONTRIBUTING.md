# Contributing

This repository publishes the JavaScript and TypeScript package for MailSchema. The protocol schemas and shared validation model are maintained in [`mailschema/mailschema`](https://github.com/mailschema/mailschema); language-specific API, CLI and packaging changes belong here and must remain compatible with those canonical files.

Run the package checks before opening a pull request:

```sh
npm ci
npm test
npm pack --dry-run
```

Changes to MAP behavior, shared schemas or Registry records should begin in the [main project repository](https://github.com/mailschema/mailschema/blob/main/CONTRIBUTING.md).

