#!/bin/sh

mongoimport --host $DATABASE_HOST --db $DATABASE_DB --username $DATABASE_USER --password $DATABASE_PASSWORD --authenticationDatabase admin --type json --collection organizations --file scripts/database/organizations.json
mongoimport --host $DATABASE_HOST --db $DATABASE_DB --username $DATABASE_USER --password $DATABASE_PASSWORD --authenticationDatabase admin --type json --collection repositories --file scripts/database/repositories.json
mongoimport --host $DATABASE_HOST --db $DATABASE_DB --username $DATABASE_USER --password $DATABASE_PASSWORD --authenticationDatabase admin --type json --collection users --file scripts/database/users.json
