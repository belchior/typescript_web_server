#!/bin/sh

mongosh --host $DATABASE_HOST --port $DATABASE_PORT --db $DATABASE_DB --username $DATABASE_USER --password $DATABASE_PASSWORD --authenticationDatabase admin
