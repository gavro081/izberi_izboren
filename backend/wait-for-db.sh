#!/bin/bash
set -e

host="$1"
port="$2"
shift 2
cmd="$@"

# Wait until PostgreSQL is ready
until PGPASSWORD="$DB_PASS" psql -h "$host" -p "$port" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd