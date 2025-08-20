# Hirechannel Video Interview – React + Rails

## Overview
This project is a modern, AI-powered video interview system with customizable questions and job descriptions:

- **React frontend** with a beautiful, responsive UI for recording video answers (camera/mic permissions, start/stop controls, 60s countdown auto-stop)
- **Ruby on Rails API** that receives uploads, stores them via Active Storage, and enqueues background jobs
- **Sidekiq** processes each answer asynchronously: extracts audio (ffmpeg), transcribes with OpenAI Whisper, evaluates with an LLM using job context, and stores the transcript and a score (1–5)
- **Customizable Interview Questions** - Create, edit, and manage interview questions with custom AI evaluation prompts
- **Job Description Management** - Configure job context that's included in all AI evaluations for more accurate scoring
- **Modern UI** with navigation, status badges, loading states, and responsive design
- **Answers dashboard** with a clean table view showing submission time, question ID, status, transcript, and AI-generated score

## Key Features

### 🎥 Video Recording
- Camera and microphone permission handling
- Start/stop recording controls with visual feedback
- 60-second countdown timer with automatic stop
- Real-time video preview during recording
- Automatic upload upon completion

### 🤖 AI-Powered Evaluation
- **Speech-to-Text**: OpenAI Whisper API for accurate transcription
- **Intelligent Scoring**: GPT-4o-mini evaluates responses with job context
- **Custom Prompts**: Each question has its own evaluation criteria
- **Job Context**: Job description is included in all evaluations for relevance

### 📝 Question Management
- Create and edit interview questions
- Custom AI evaluation prompts for each question
- Question ordering and activation controls
- Professional interface for managing interview content

### 💼 Job Description Management
- Configure job title and description
- Single active job description system
- Job context automatically included in all AI evaluations
- Easy editing and updating of job requirements

### 📊 Results Dashboard
- View all recorded answers with status tracking
- See transcripts and AI-generated scores (1-5)
- Track processing status (queued, processing, completed, failed)
- Clean, sortable table interface

## Key Design Decisions
- **Async processing (Sidekiq + Redis)**: keeps uploads fast and resilient; transcription/evaluation run outside the request
- **Active Storage (local)**: minimal storage for uploaded videos; easy to swap providers later
- **OpenAI integration**: Whisper for transcription; `gpt-4o-mini` for evaluation with job context
- **ffmpeg extraction**: Converts webm video to 16kHz mono WAV to ensure robust transcription
- **CORS**: Frontend dev server (`http://localhost:5173`) allowed by API
- **SQLite**: lightweight DB for local/dev simplicity
- **Customizable Content**: Questions and job descriptions can be managed through the UI

## Requirements
- macOS or Linux
- Node.js 22.12+ (or 20.19+), npm
- Ruby 3.3.x, Bundler, Rails 8
- Redis
- ffmpeg
- OpenAI API key

## Setup

### Option 1: Local Development

1) Clone and install dependencies
```bash
cd /Users/joaotorres/Projects/hirechannel

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && bundle install && bin/rails db:migrate && bin/rails db:seed && cd ..
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
- Ensure ffmpeg is installed (e.g., `brew install ffmpeg`)
- If Sidekiq cannot see `OPENAI_API_KEY`, it's loaded via dotenv in `config/initializers/sidekiq.rb` for development
- The seed data creates default questions and a job description to get you started

### Option 2: Docker Setup
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

## Usage

### Recording Interviews
1. Visit `http://localhost:5173` to access the main recording interface
2. Click "Enable Camera & Mic" to grant permissions
3. Select a question and click "Start Recording"
4. Record your answer (auto-stops at 60 seconds)
5. Review and upload your response

### Managing Questions
1. Navigate to `http://localhost:5173/questions`
2. View existing questions and their evaluation prompts
3. Click "Edit" to modify questions or prompts
4. Click "Add Question" to create new interview questions
5. Customize AI evaluation criteria for each question

### Managing Job Description
1. On the Questions page, scroll to the "Job Description" section
2. Click "Edit" to modify the job title and description
3. The job context will be automatically included in all AI evaluations
4. Only one job description can be active at a time

### Viewing Results
1. Navigate to `http://localhost:5173/answers`
2. View all recorded answers with their status
3. See transcripts and AI-generated scores
4. Track processing status of each submission

## API Summary

### Answers
- `POST /api/answers` (multipart): fields `video` (file), `questionId` (string). Returns `202 { id }`
- `GET /api/answers`: list answers with `id, question_id, status, transcript, score, created_at`
- `GET /api/answers/:id`: show one answer

### Questions
- `GET /api/questions`: list all active questions
- `POST /api/questions`: create new question
- `PUT /api/questions/:id`: update question
- `DELETE /api/questions/:id`: deactivate question

### Job Descriptions
- `GET /api/job_descriptions/current`: get active job description
- `POST /api/job_descriptions`: create new job description (deactivates others)

## AI Evaluation Process

When a video answer is submitted:

1. **Video Processing**: Video is stored and audio extracted using ffmpeg
2. **Transcription**: OpenAI Whisper converts audio to text
3. **Context Preparation**: Job description and question-specific prompt are combined
4. **AI Evaluation**: GPT-4o-mini evaluates the response considering:
   - Job context (title and description)
   - Question-specific evaluation criteria
   - Candidate's transcribed response
5. **Scoring**: Returns integer score 1-5 based on relevance, quality, and fit

## Future Improvements
- Persist job results to an external store and add pagination/filtering on the Answers page
- Upload directly to cloud storage; presigned URLs
- Add retries/backoff and better error UI
- Add tests and CI
- Multiple job descriptions support
- Advanced analytics and reporting
- Candidate management system


