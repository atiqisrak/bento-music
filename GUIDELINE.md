# Bento Music Developer Guidelines

Welcome to the **Bento Music** project! This document outlines the procedures for setting up, running, and managing the development servers.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Setup and Installation

1. Clone the repository and navigate into the project directory.
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Install the frontend dependencies:
   ```bash
   npm --prefix frontend install
   ```

## Starting the Servers

The project is structured with an Express backend running on port `3001` and a Vite React frontend running on port `5173`. We use `concurrently` to run both servers with a single command.

To start the full development environment, run:
```bash
npm run dev
```

### Starting Individually

If you need to run them separately for debugging or isolated testing:

- **Backend Only**:
  ```bash
  npm run devStart
  ```
- **Frontend Only**:
  ```bash
  npm --prefix frontend run dev
  ```

## Server Configurations

- **Backend Port**: Configurable in `src/server.ts` (default: `3001`).
- **Frontend Port**: Configurable in `frontend/vite.config.ts` (default: `5173`).
- **Proxy**: The frontend Vite configuration (`frontend/vite.config.ts`) proxies `/api` requests automatically to `http://localhost:3001` to bypass CORS restrictions during development.

## Stopping the Servers

To stop the concurrently running servers, press `Ctrl + C` in your terminal. You may be prompted to terminate the batch job; type `Y` and press Enter.

## Sync Task Execution

To sync the latest tracks from NCS, use the built-in "Sync Data" feature available from the frontend UI or manually invoke the API at `http://localhost:3001/api/sync`. This will scrape tracks in the background and store them locally in `synced_data.json`.
