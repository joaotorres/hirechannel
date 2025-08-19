#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/tmp/pids/server.pid

# Install dependencies
bundle install

# Create database if it doesn't exist
bundle exec rails db:create

# Run database migrations
bundle exec rails db:migrate

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
