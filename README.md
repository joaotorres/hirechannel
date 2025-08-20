## Hirechannel Video Interview – React + Rails

### Overview
This project is a modern, AI-powered video interview system:
- **React frontend** with a beautiful, responsive UI for recording video answers (camera/mic permissions, start/stop controls, 60s countdown auto-stop)
- **Ruby on Rails API** that receives uploads, stores them via Active Storage, and enqueues background jobs
- **Sidekiq** processes each answer asynchronously: extracts audio (ffmpeg), transcribes with OpenAI Whisper, evaluates with an LLM, and stores the transcript and a score (1–5)
- **Modern UI** with navigation, status badges, loading states, and responsive design
- **Answers dashboard** with a clean table view showing submission time, question ID, status, transcript, and AI-generated score

### Key Design Decisions
- **Async processing (Sidekiq + Redis)**: keeps uploads fast and resilient; transcription/evaluation run outside the request.
- **Active Storage (local)**: minimal storage for uploaded videos; easy to swap providers later.
- **OpenAI integration**: Whisper for transcription; `gpt-4o-mini` for evaluation. Prompt returns a single integer 1–5.
- **ffmpeg extraction**: Converts webm video to 16kHz mono WAV to ensure robust transcription.
- **CORS**: Frontend dev server (`http://localhost:5173`) allowed by API.
- **SQLite**: lightweight DB for local/dev simplicity.

### Requirements
- macOS or Linux
- Node.js 22.12+ (or 20.19+), npm
- Ruby 3.3.x, Bundler, Rails 8
- Redis
- ffmpeg
- OpenAI API key

### Setup
1) Clone and install dependencies
```bash
cd /Users/joaotorres/Projects/hirechannel

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && bundle install && bin/rails db:migrate && cd ..
```

2) Configure environment
```bash
# Backend .env (create backend/.env)
OPENAI_API_KEY=sk-...
# Redis URL is auto-detected:
# - Local: redis://localhost:6379/0
# - Docker: redis://redis:6379/0
```

The configuration automatically detects whether you're running locally or in Docker and sets the appropriate Redis URL.

3) Start services
```bash
# Redis
redis-server --daemonize yes

# Sidekiq (from backend/)
cd backend && bundle exec sidekiq -C config/sidekiq.yml &

# Rails API (from backend/)
bin/rails s -p 3000 &

# Frontend (from frontend/)
cd ../frontend && npm run dev
```

Notes:
- Ensure ffmpeg is installed (e.g., `brew install ffmpeg`).
- If Sidekiq cannot see `OPENAI_API_KEY`, it’s loaded via dotenv in `config/initializers/sidekiq.rb` for development.

#### Option 2: Docker Setup
For a containerized setup, see [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed instructions.

Quick start with Docker:
```bash
# Create .env file in root directory
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env

# Start all services
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Sidekiq Dashboard: http://localhost:3000/sidekiq

### Usage
- Visit `http://localhost:5173` to record answers (up to 5). Recording auto-stops at 60s and uploads.
- View submissions at `http://localhost:5173/answers`.

### API Summary
- `POST /api/answers` (multipart): fields `video` (file), `questionId` (string). Returns `202 { id }`.
- `GET /api/answers`: list answers with `id, question_id, status, transcript, score, created_at`.
- `GET /api/answers/:id`: show one.

### Future Improvements
- Persist job results to an external store and add pagination/filtering on the Answers page.
- Upload directly to cloud storage; presigned URLs.
- Add retries/backoff and better error UI.
- Add tests and CI.


