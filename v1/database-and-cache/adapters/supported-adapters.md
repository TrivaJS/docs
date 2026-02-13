# Database Adapter Support

Triva provides a powerful, flexible caching system with support for multiple database adapters. This is a full list of all supported database adapters, and the minimum version required for each adapater.

### Supported Adapters

| Adapter | Introduced In Version | Minimum Version | Developer Note |
|-----------------|----------------| ----------------|----------------|
| Memory | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | Built into primary library for every version. |
| Embedded | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | Built into primary library for every version. |
| MongoDB| [v1.0.0](https://docs.trivajs.com/v1/getting-started) | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | Built into v1.0.0, requires adapter extenions for v1.1.0 and newer |
| Redis | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | Built into v1.0.0, requires adapter extenions for v1.1.0 and newer |
| PostgreSQL | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | Built into v1.0.0, requires adapter extenions for v1.1.0 and newer |
| SQLite | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | Built into v1.0.0, requires adapter extenions for v1.1.0 and newer |
| MySQL | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | Built into v1.0.0, requires adapter extenions for v1.1.0 and newer |
| Supabase | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | Built into v1.0.0, requires adapter extenions for v1.1.0 and newer |
| Better-SQLite3 | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | [v1.0.0](https://docs.trivajs.com/v1/getting-started) | Built into v1.0.0, requires adapter extenions for v1.1.0 and newer |

> ### Changes Coming to Adapters v1.1.0
> In an effort to reduce the size-based costs of all of our database adapters, in **v1.1.0**, we will introduce an adapter extension. This gives developers the ability to directly install the adapter for the database they're using, without having to install our growing number of adapters in their entirety.

### Adapter Documentation

For a full overview of database adapter capabilities, please visit the overview page in the **Database & Cache section** for the version you use.
