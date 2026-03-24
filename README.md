# Learning GraphQL

> The purpose of this repository is to practice GraphQL acquired knowledge as well as your ecosystem

The purpose of this **branch** is to find out the best setup and usage of the specified stack. Each branch at this repo has a unique stack, take a look at [all branches](https://github.com/belchior/typescript_web_server/branches/all).

## Stack

The `server` is based on

- [TypeScript](https://github.com/microsoft/TypeScript)
- [Node.js](https://github.com/nodejs/node)
- [Express](https://github.com/expressjs/express)
- [PostgreSQL](https://www.postgresql.org/)

The `client` is based on

- [TypeScript](https://github.com/microsoft/TypeScript)
- [React.js](https://github.com/facebook/react)
- [Relay Modern](https://github.com/facebook/relay)

The server implement the [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm) to handle paginated list and are compliance with [Relay GraphQL Server Specification](https://relay.dev/docs/en/graphql-server-specification.html) to take's advantages of Relay Modern features.

## Development

### Server

You can start the server in development mode executing the command below

```shell
docker compose up server
```

To run test in development mode
```shell
docker compose run --rm server npm run test:dev
```

To run tests

### Client

To run client in development mode execute the command below

```shell
docker compose up client
```

To recompile relay after modifications

```shell
docker compose run --rm client npm run relay
```

### Integration between server and client

After change some definition inside `server/src/infrastructure/graphql_server` the client must run the script below to update the graphql schema located at `client/schema.graphql`.

```shell
npm run get-schema
```

## References

Some links that have somehow helped to develop this project or influenced my decisions

### Docs

- [GitHub GraphQL API](https://docs.github.com/en/graphql/overview/about-the-graphql-api)
- [GraphQL Specification](http://spec.graphql.org/June2018/)
- [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
- [Relay - GraphQL Server Specification](https://relay.dev/docs/guides/graphql-server-specification/)
- [Relay - Fragment](https://relay.dev/docs/tutorial/fragments-1/)
- [Relay - Pagination](https://relay.dev/docs/tutorial/connections-pagination/)
- [Relay - Testing Relay Components](https://relay.dev/docs/guides/testing-relay-components/)
- [Getting Started With GraphQL.js](https://www.graphql-js.org/docs/)
- [DataLoader](https://github.com/graphql/dataloader)
- [GraphQL Foundation](https://graphql.org/community/foundation/)
- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)


### Articles

- [Input object type as an argument for GraphQL mutations and queries](https://atheros.ai/blog/input-object-type-as-an-argument-for-graphql-mutations-and-queries)
- [GraphQL Resolvers: Best Practices](https://medium.com/paypal-engineering/graphql-resolvers-best-practices-cd36fdbcef55)
- [Code-first vs. schema-first development in GraphQL](https://blog.logrocket.com/code-first-vs-schema-first-development-graphql/)
- [Solving the N+1 Problem for GraphQL through Batching](https://engineering.shopify.com/blogs/engineering/solving-the-n-1-problem-for-graphql-through-batching)
- [Five ways to paginate in Postgres, from the basic to the exotic](https://www.citusdata.com/blog/2016/03/30/five-ways-to-paginate/)
- [React+TypeScript Cheatsheets](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet)
- [stackoverflow - TypeScript: Interfaces vs Types](https://stackoverflow.com/questions/37233735/typescript-interfaces-vs-types#answer-52682220)

### Videos

- [DataLoader – Source code walkthrough](https://www.youtube.com/watch?v=OQTnXNCDywA)
- [Lessons from 4 Years of GraphQL](https://www.youtube.com/watch?v=zVNrqo9XGOs)
- [How To Use Fragments (They're Not for Re-use!)](https://www.youtube.com/watch?v=gMCh8jRVMiQ)
