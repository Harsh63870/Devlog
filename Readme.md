# DevLog

AI-style Git Commit + PR Generator for developers.

## Features

- Reads staged git diff
- Generates commit messages
- Generates PR descriptions
- Shows diff statistics
- Copy-to-clipboard support
- React + FastAPI architecture

## Tech Stack

Frontend:
- React
- Vite

Backend:
- FastAPI
- Python

## Workflow

git add .
↓
Generate DevLog
↓
Copy commit + PR text
↓
Paste into GitHub

## Run Locally

### Backend

cd backend
source venv/bin/activate
uvicorn main:app --reload

### Frontend

cd frontend
npm install
npm run dev

## Future Improvements

- Ollama local AI support
- Docker support
- GitHub Actions
- Commit history
- Markdown export