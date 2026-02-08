# Full Stack App (COPYING/FORKING THIS TEMPLATE)

A minimal full-stack application skeleton with React + Vite (frontend) and Express (backend).

## Project Structure

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

└── package.json     # Root package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation Instructions



1. **Install server dependencies**:
   ```(in the terminal line)
   cd server
   npm install
   ```

2. **Install client dependencies**:
   ```(in the terminal line)
   cd ../client
   npm install
   ```

3. **Go back to root**:
   ```(in the terminal line)
   cd ..
   ```

4. **Install root dependencies**:
   ```(in the terminal line)
   npm install
   ```

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

**The frontend will display a message fetched from the backend API.**



## Individual Commands

If you want to run them separately:

**Backend only:**
```(in the terminal line)
cd server && npm start
```

**Frontend only (from root or client directory):**
```(in the terminal line)
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
Edit `server/server.js`:
```javascript
app.get('/api/your-endpoint', (req, res) => {
  res.json({ data: 'your response' })
})
```

### Add a new React component (frontend)
Create a new file in `client/src/` and import it in `App.jsx`.

## Notes

- The frontend automatically opens in Chrome (configured in Vite)
- CORS is enabled to allow frontend-backend communication
- Development mode watches for file changes and hot-reloads
