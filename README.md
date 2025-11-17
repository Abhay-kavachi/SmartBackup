# SmartBackup OS

SmartBackup OS is a full-stack backup, versioning, and recovery system that combines a high-performance Flask backend and a modern React dashboard with an integrated AI assistant.

## Features

- JWT-based authentication with per-user data isolation
- Virtual file system for watch/delete/recover/version operations
- Delta-based AES-encrypted, ZIP-compressed backups
- Thread-safe backup queue, scheduler, file watcher, and power guard
- React dashboard with TailwindCSS, Recharts, Framer Motion, and Battery API integration
- Chatbot assistant “Chitty” for command-driven operations

## Project Structure

```
backend/   # Flask API, services, models
frontend/  # React + Vite dashboard
storage/   # Encrypted backup artifacts (created automatically)
```

## Backend Setup

1. **Install dependencies**

   ```bash
   cd backend
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   ```

2. **Environment variables**

   Copy `env.sample` to `.env` (or export variables manually) and update the MySQL URI, secrets, and AES key.

3. **Run the API**

   ```bash
   flask --app backend.app run --host 0.0.0.0 --port 5001
   ```

   The API spins up the backup manager, scheduler, watcher, and chatbot automatically.

## Frontend Setup

1. **Install dependencies**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment variables**

   Create `frontend/.env` with:

   ```
   VITE_API_URL=http://localhost:5001/api
   ```

3. **Run the dashboard**

   ```bash
   npm run dev
   ```

   The app runs on `http://localhost:5173` and communicates with the Flask API.

## Usage Notes

- Register/log in, add files to watch, and monitor jobs in real time.
- Battery levels below 10% automatically pause queued backups until charging resumes.
- Use the Chitty assistant commands (e.g., “show backups”, “schedule hourly backups”) for quick control.
- All encrypted backup blobs are written under `storage/`.

## Tests and Validation

- Ensure MySQL is reachable before starting the backend.
- After starting both services, verify:
  - `GET /api/health` returns `{"status": "ok"}`
  - Frontend can register/login and interact with the API without errors.

Enjoy reliable, lightweight backups with SmartBackup OS!

