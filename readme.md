# Bento Music

Bento Music is a premium platform for discovering, exploring, and downloading millions of NoCopyrightSounds (NCS) tracks. Built with a modern, dynamic interface, it provides a seamless experience for creators, developers, and music lovers to access high-quality copyright-free music.

## Features

- **Discover Millions of Tracks**: Browse through an extensive library of NCS music.
- **Advanced Search & Filtering**: Find exactly what you need by genre, mood, or artist.
- **One-Click MP3 Downloads**: Secure, direct downloads of your favorite tracks with proper formatting and `.mp3` extensions.
- **Data Synchronization**: Built-in background sync to fetch and export the entire music database as a customized `ncs_synced_data.json` file containing tags, moods, and settings.
- **Premium UI**: A sleek, dark-themed glassmorphism interface built with React and Vite.

## Tech Stack

- **Frontend**: React, Vite, TypeScript, Lucide Icons, Vanilla CSS
- **Backend**: Express, Node.js, Axios
- **Scraper API**: JSDOM, TypeScript

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository and install all dependencies:

   ```bash
   npm install
   cd frontend && npm install
   ```

2. Run the development server (starts both backend and frontend):

   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`.

## API Endpoints

The Express backend (`http://localhost:3001`) provides several powerful endpoints:

- `GET /api/songs?page=0`: Fetch paginated songs.
- `GET /api/search?q=query&genre=House&mood=Happy`: Advanced search functionality.
- `GET /api/download.mp3?url=<URL>&filename=<NAME>`: Proxy download endpoint that forces proper `.mp3` file saving.
- `GET /api/sync`: Initiates a background worker to scrape and organize all NCS data into a structured JSON file.
- `GET /api/synced-data.json`: Downloads the fully generated `ncs_synced_data.json` file.

## License

This project is licensed under the GPL-3.0 License.
