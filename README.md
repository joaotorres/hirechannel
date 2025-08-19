## Hirechannel Video Interview – React + Rails

### Overview
This project is a simplified video interview system:
- React frontend lets candidates record answers (camera/mic permissions, start/stop, 60s countdown auto-stop) and uploads videos.
- Ruby on Rails API receives uploads, stores them via Active Storage, and enqueues background jobs.
- Sidekiq processes each answer asynchronously: extracts audio (ffmpeg), transcribes with OpenAI Whisper, evaluates with an LLM, and stores the transcript and a score (1–5).

A simple Answers page lists submissions with time, question id, status, transcript, and score.

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
REDIS_URL=redis://localhost:6379/0
```

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


