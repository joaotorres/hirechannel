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

redis_url = ENV.fetch("REDIS_URL", "redis://localhost:6379/0")

Sidekiq.configure_server do |config|
  config.redis = { url: redis_url }
end

Sidekiq.configure_client do |config|
  config.redis = { url: redis_url }
end

