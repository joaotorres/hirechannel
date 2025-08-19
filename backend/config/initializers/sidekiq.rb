# frozen_string_literal: true

require "sidekiq"

# Ensure .env is loaded for background jobs in development
if ENV["RAILS_ENV"] == "development" || defined?(Rails) && Rails.env.development?
  begin
    require "dotenv"
    Dotenv.load
  rescue LoadError
    # dotenv not available; ignore
  end
end

# Auto-detect Redis URL based on environment
# In Docker, use the service name 'redis'
# Locally, use 'localhost'
redis_url = if ENV["DOCKER_ENV"] == "true"
  ENV.fetch("REDIS_URL", "redis://redis:6379/0")
else
  # For local development, always use localhost regardless of what's in .env
  "redis://localhost:6379/0"
end

Sidekiq.configure_server do |config|
  config.redis = { url: redis_url }
end

Sidekiq.configure_client do |config|
  config.redis = { url: redis_url }
end

