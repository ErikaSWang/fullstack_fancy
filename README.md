# Full Stack App

A minimual full-stack application that strives to be state-of-the-art secure
Frontend: Vite React Javascript
Backend: Express

Additional external sources used:
- Supabase DB
- Upstash Redis Cache
- Vercel deployment
- Sentry error logging

* Accounts & keys needed for forking


## Basic Project Structure

```
.
├── .vscode/           # IDE Settings
│   ├── launch.json/

├── backend/          # Express backend
│   ├── server.js
│   └── package.json

├── frontend/          # React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js

├── package.json     # Root package.json
├── .env             # NEED TO ADD ENVIRONMENT VARIABLES, TO GET THIS TO WORK
└── vercel.json      # Needed to deploy to Vercel
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm

### Once you have signed up for Supabase, Upstash, and Sentry ...

### Installation Instructions
- npm install dependencies in:
   - backend
   - frontend
   - root


### Running the App

Start both the backend and frontend with one command:

PRESS RUN


```(in the terminal line)
npm run dev
```

This will:
- Start the Express server on `http://localhost:3000`
- Start the Vite dev server on `http://localhost:5000`
- Automatically open your browser to the frontend



## Individual Commands

If you want to run them separately - open TWO terminals (with split panel)

**Backend only:**
```(in terminal line #1)
cd server && npm start
```

**Frontend only:**
```(in terminal line #2)
cd client && npm run dev
```


## How It Works

1. **Frontend** (`client/`) - React app running on port 5000
   - Makes a request to `/api/hello` on the backend
   - Displays the response message

2. **Backend** (`server/`) - Express API running on port 3000
   - Serves `/api/hello` endpoint
   - Returns a JSON message

3. **Proxy** - Vite is configured to proxy API requests to the backend



## Adding Features

### Add a new API endpoint (backend)

Entry point is server.js


### Add a new React component (frontend)

Entry point is index.html -> src/main.jsx -> src/App.jsx -> src/components/Root.jsx -> then ../(various pages)


## Notes
- The frontend automatically opens in Chrome (configured in Vite)
- Development mode watches for file changes and hot-reloads
