# Learning MongoDB

> The purpose of this repository is to practice acquired knowledge in build web services with TypeScript as well as your ecosystem

The purpose of this **branch** is to find out the best setup and usage of the specified stack. Each branch at this repo has a unique stack, take a look at [all branches](https://github.com/belchior/typescript_web_server/branches/all).

## Stack

The `server` is based on

- [TypeScript](https://github.com/microsoft/TypeScript)
- [Node.js](https://github.com/nodejs/node)
- [Express](https://github.com/expressjs/express)
- [MongoDB](https://www.mongodb.org/)
- [Swagger](https://swagger.io/)

The `client` is based on

- [TypeScript](https://github.com/microsoft/TypeScript)
- [React.js](https://github.com/facebook/react)
- [SWR](https://swr.vercel.app/docs/getting-started)

The server implements the [Relay Cursor Connections Specification](https://relay.dev/graphql/connections.htm) to handle paginated list

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

Some links that have somehow helped to develop this project or influence my decisions

### Docs

- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Swagger OpenAPI Guide](https://swagger.io/docs/specification/v3_0/basic-structure/)
- [SWR Getting Started](https://swr.vercel.app/docs/getting-started)
- [Aggregation Operations](https://www.mongodb.com/docs/manual/aggregation/)


### Articles

- [Testing for NoSQL Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection)
- [4 Common Misconceptions About Security That Hackers Hope You Don't Know](https://www.mongodb.com/company/blog/technical/hack-common-security-issues-fix-them)
- [How does MongoDB address SQL or Query injection?](https://www.mongodb.com/docs/manual/faq/fundamentals/#how-does-mongodb-address-sql-or-query-injection-)
