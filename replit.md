# Full Stack App

A minimal full-stack application with React + Vite frontend and Express backend.

## Overview

This project consists of:
- **Frontend**: React app with Vite (runs on port 5000)
- **Backend**: Express API server (runs on port 3000)

## Project Structure

```
.
├── client/          # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── server/          # Express backend
│   ├── server.js
│   └── package.json
└── package.json     # Root package.json with concurrently
```

## Running the App

The app runs with a single command via the workflow:
```
npm run dev
```

This starts both:
- Express server on http://localhost:3000
- Vite dev server on http://0.0.0.0:5000

## API Endpoints

- `GET /api/hello` - Returns a greeting message from the backend

## Configuration

- Vite is configured to proxy `/api` requests to the Express backend
- Frontend is accessible on port 5000 (Replit's exposed port)
- Backend runs internally on port 3000


## REPLIT IS 1-CLICK!