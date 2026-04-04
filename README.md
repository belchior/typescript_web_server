# Learning Postgres

> The purpose of this repository is to practice acquired knowledge in build web services with TypeScript as well as your ecosystem

The purpose of this **branch** is to find out the best setup and usage of the specified stack. Each branch at this repo has a unique stack, take a look at [all branches](https://github.com/belchior/typescript_web_server/branches/all).

## Stack

The `server` is based on

- [TypeScript](https://github.com/microsoft/TypeScript)
- [Node.js](https://github.com/nodejs/node)
- [Express](https://github.com/expressjs/express)
- [PostgreSQL](https://www.postgresql.org/)
- [Swagger](https://swagger.io/)

The `client` is based on

- [TypeScript](https://github.com/microsoft/TypeScript)
- [React.js](https://github.com/facebook/react)
- [SWR](https://swr.vercel.app/docs/getting-started)

The server implement the [Relay Cursor Connections Specification](https://relay.dev/graphql/connections.htm) to handle paginated list and are compliance with [Relay Relay Server Specification](https://relay.dev/docs/en/graphql-server-specification.html) to take's advantages of Relay Modern features.

## Development

### Server

You can start the server in development mode executing the command below

```shell
docker compose up server
```

To add sample data to feed the application
```shell
docker compose run --rm database_seed
```

To run test in development mode
```shell
docker compose run --rm server npm run test:dev
```

### Client

To run the client in development mode execute the command below

```shell
docker compose up client
```

## References

Some links that have somehow helped to develop this project or influenced my decisions

### Docs

- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Swagger OpenAPI Guide](https://swagger.io/docs/specification/v3_0/basic-structure/)
- [SWR Getting Started](https://swr.vercel.app/docs/getting-started)


### Articles

- [Five ways to paginate in Postgres, from the basic to the exotic](https://www.citusdata.com/blog/2016/03/30/five-ways-to-paginate/)
