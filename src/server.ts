import express from 'express';
import cors from 'cors';
import * as ncs from './main';
import axios from 'axios';
import fs from 'fs/promises';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/songs', async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 0;
        const songs = await ncs.getSongs(page);
        res.json(songs);
    } catch (error) {
        console.error('Error fetching songs:', error);
        res.status(500).json({ error: 'Failed to fetch songs' });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q as string;
        const page = parseInt(req.query.page as string) || 0;
        const genre = req.query.genre as string;
        const mood = req.query.mood as string;

        const results = await ncs.search({
            search: query,
            genre: genre ? (ncs.Genre as any)[genre] : undefined,
            mood: mood ? (ncs.Mood as any)[mood] : undefined
        }, page);
        res.json(results);
    } catch (error) {
        console.error('Error searching songs:', error);
        res.status(500).json({ error: 'Failed to search songs' });
    }
});

app.get('/api/artist', async (req, res) => {
    try {
        const url = req.query.url as string;
        if (!url) {
            return res.status(400).json({ error: 'Artist URL is required' });
        }
        const artistInfo = await ncs.getArtistInfo(url);
        res.json(artistInfo);
    } catch (error) {
        console.error('Error fetching artist info:', error);
        res.status(500).json({ error: 'Failed to fetch artist info' });
    }
});
app.get('/api/download.mp3', async (req, res) => {
    try {
        const { url, filename } = req.query;
        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'URL is required' });
        }
        const name = (filename as string) || 'download';
        const finalName = name.endsWith('.mp3') ? name : `${name}.mp3`;

        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream'
        });

        // Use RFC 5987 encoding for safe filenames
        const encodedName = encodeURIComponent(finalName).replace(/['()]/g, escape).replace(/\*/g, '%2A');
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedName}`);
        res.setHeader('Content-Type', 'audio/mpeg');
        
        response.data.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download file' });
    }
});

let isSyncing = false;

app.get('/api/sync', async (req, res) => {
    if (isSyncing) {
        return res.status(409).json({ message: 'Sync already in progress' });
    }
    isSyncing = true;
    res.json({ message: 'Sync started. This will run in the background.' });

    try {
        let allSongs: any[] = []
        let page = 0
        let hasMore = true
        let consecutiveFailures = 0
        const MAX_CONSECUTIVE_FAILURES = 3

        while (hasMore) {
            console.log(`Syncing page ${page}...`)
            try {
                const songs = await ncs.getSongs(page)
                if (songs.length === 0) {
                    hasMore = false
                    break
                }

                const enhancedSongs = songs.map(song => ({
                    Title: song.name,
                    Url: song.url,
                    Tags: ["luxury", "nightlife", "city lights", "helicopter", "infinity pool", "floating lanterns", "high-rise", "upscale travel"],
                    Moods: ["confident", "happy"],
                    Settings: ["hotel", "pool", "outdoor"],
                    DurationSecs: 0,
                    // Original metadata
                    OriginalGenre: song.genre,
                    OriginalTags: song.tags,
                    PreviewUrl: song.previewUrl,
                    DownloadUrl: song.download.regular,
                    CoverUrl: song.coverUrl,
                    Date: song.date
                }))

                allSongs = allSongs.concat(enhancedSongs)
                consecutiveFailures = 0 // reset on success
                page++
            } catch (pageError) {
                consecutiveFailures++
                console.error(`Error syncing page ${page} (failure ${consecutiveFailures}/${MAX_CONSECUTIVE_FAILURES}):`, pageError)
                if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
                    console.error('Too many consecutive failures — stopping sync early.')
                    hasMore = false
                    break
                }
                page++ // skip to next page and keep going
            }

            // Polite delay between requests to avoid rate limiting
            await new Promise(r => setTimeout(r, 1000))
        }

        await fs.writeFile('synced_data.json', JSON.stringify(allSongs, null, 2))
        console.log(`Sync complete. Saved ${allSongs.length} songs.`)
    } catch (error) {
        console.error('Error during sync:', error)
    } finally {
        isSyncing = false
    }
});

app.get('/api/synced-data.json', async (req, res) => {
    try {
        const data = await fs.readFile('synced_data.json', 'utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="ncs_synced_data.json"');
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    } catch (error) {
        res.status(404).json({ error: 'No synced data found. Run sync first.' });
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
