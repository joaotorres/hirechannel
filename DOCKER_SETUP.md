# Docker Setup for Hirechannel

This guide will help you run the Hirechannel video interview system using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- OpenAI API key for transcription and evaluation

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# OpenAI API Key for transcription and evaluation
OPENAI_API_KEY=your_openai_api_key_here

# Rails environment
RAILS_ENV=development

# Frontend API URL
VITE_API_URL=http://localhost:3000
```

**Note**: Redis URL is automatically configured for Docker environment.

## Running the Application

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - List of submitted answers: http://localhost:5173/answers
   - Backend API: http://localhost:3000
   - Sidekiq Dashboard: http://localhost:3000/sidekiq
   - Redis: localhost:6379

## Services

The Docker setup includes the following services:

- **frontend**: React application with Vite dev server
- **backend**: Rails API server
- **sidekiq**: Background job processor for video processing
- **redis**: Database for Sidekiq job queue

## Development

For development, the services are configured with volume mounts for hot reloading:

- Frontend changes will automatically reload
- Backend changes will require restarting the backend container

## Stopping the Application

```bash
docker-compose down
```

To also remove volumes (this will delete Redis data):
```bash
docker-compose down -v
```

## Troubleshooting

1. **If the frontend can't connect to the backend:**
   - Make sure all services are running: `docker-compose ps`
   - Check backend logs: `docker-compose logs backend`

2. **If video processing fails:**
   - Check Sidekiq logs: `docker-compose logs sidekiq`
   - Verify OpenAI API key is set correctly

3. **If Redis connection fails:**
   - Check Redis logs: `docker-compose logs redis`
   - Restart Redis: `docker-compose restart redis`

## Production

For production deployment, you should:

1. Set `RAILS_ENV=production`
2. Use proper SSL certificates
3. Configure proper database (PostgreSQL instead of SQLite)
4. Set up proper logging and monitoring
5. Use a reverse proxy (nginx) for the frontend
