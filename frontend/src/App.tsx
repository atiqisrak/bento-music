import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search, Play, Pause, Download, RefreshCw, Database, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import Developers from './pages/Developers';

const API_BASE = 'http://localhost:3001/api';

interface Song {
  id: string;
  name: string;
  url: string;
  artists: { name: string; url: string }[];
  genre: string;
  coverUrl?: string;
  date: string;
  download: { regular: string; instrumental: string };
  previewUrl?: string;
}

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [page, setPage] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  
  // Audio Player State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

  const fetchSongs = async (p = 0) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/songs`, { params: { page: p } });
      if (p === 0) setSongs(res.data);
      else setSongs([...songs, ...res.data]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSongs(0);
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error('Play error:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSongs(nextPage);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/search`, {
        params: { q: searchQuery, genre: genreFilter }
      });
      setSongs(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus('Sync started... check backend logs.');
      await axios.get(`${API_BASE}/sync`);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setSyncStatus("Sync is already in progress.");
      } else {
        setSyncStatus("Failed to start sync.");
      }
    } finally {
      setTimeout(() => setSyncStatus(''), 5000);
      setIsSyncing(false);
    }
  };

  const playSong = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!currentSong) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    if (idx !== -1 && idx < songs.length - 1) {
      setCurrentSong(songs[idx + 1]);
      setIsPlaying(true);
    }
  };

  const playPrev = () => {
    if (!currentSong) return;
    const idx = songs.findIndex(s => s.id === currentSong.id);
    if (idx > 0) {
      setCurrentSong(songs[idx - 1]);
      setIsPlaying(true);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Unknown Date";
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  return (
    <BrowserRouter>
      <header className="ncs-header">
        <Link to="/" className="logo">Bento Music</Link>
        <nav className="ncs-nav flex-wrap md:flex-nowrap">
          <Link to="/">Music Library</Link>
          <Link to="/developers">Developers API</Link>
          <a href="#" onClick={(e) => { e.preventDefault(); handleSync(); }}>
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </a>
          <a href={`${API_BASE}/synced-data.json`} download="ncs_synced_data.json" target="_blank" rel="noreferrer">
            Download JSON
          </a>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={
          <>
            <div className="ncs-hero">
            <div className="ncs-hero-overlay"></div>
            <div className="ncs-hero-content">
              <h2>Copyright free music for creators.</h2>
              <p>We work with artists representing all genres of electronic music. Our music will always be free to use, allowing you to monetise without fear of copyright strikes.</p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <a href="#library" className="ncs-btn">Explore Library</a>
                <a href="#" className="ncs-btn outline">Usage Policy</a>
              </div>
            </div>
          </div>

      <form onSubmit={handleSearch} className="ncs-search-bar" id="library">
        <input 
          type="text" 
          placeholder="Search Tracks & Artists" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
          <option value="">Search Genres</option>
          <option value="Bass">Bass</option>
          <option value="Chill">Chill</option>
          <option value="DrumBass">Drum & Bass</option>
          <option value="Drumstep">Drumstep</option>
          <option value="Dubstep">Dubstep</option>
          <option value="EDM">EDM</option>
          <option value="Electronic">Electronic</option>
          <option value="FutureHouse">Future House</option>
          <option value="Hardstyle">Hardstyle</option>
          <option value="House">House</option>
          <option value="Indie">Indie</option>
          <option value="MelodicDubstep">Melodic Dubstep</option>
          <option value="Trap">Trap</option>
          <option value="GlitchHop">Glitch Hop</option>
          <option value="Phonk">Phonk</option>
          <option value="FutureBass">Future Bass</option>
          <option value="BassHouse">Bass House</option>
        </select>
        <button type="submit" className="ncs-btn">Search</button>
      </form>

      <section className="ncs-section">
        <h3>{searchQuery || genreFilter ? 'Search Results' : 'Popular Releases'}</h3>
        
        {loading && songs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Loading tracks...</p>
        ) : (
          <div className="ncs-grid">
            {songs.map((song) => (
              <div key={song.id} className="ncs-card">
                <div 
                  className="ncs-card-inner" 
                  style={{ backgroundImage: `url(${song.coverUrl || 'https://via.placeholder.com/325'})` }}
                  onClick={() => playSong(song)}
                >
                  <div className="ncs-card-overlay">
                    <div className="play-icon">
                      {currentSong?.id === song.id && isPlaying ? (
                        <Pause size={28} fill="currentColor" />
                      ) : (
                        <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
                      )}
                    </div>
                  </div>
                </div>
                <div className="ncs-card-bottom">
                  <p>{song.name}</p>
                  <span>{song.artists.map(a => a.name).join(', ')}</span>
                  
                  <div className="ncs-card-options">
                    <div>
                      <div className="date">{formatDate(song.date)}</div>
                      <div className="genre">{song.genre || 'Unknown Genre'}</div>
                    </div>
                    {song.download.regular && (
                      <a 
                        href={`${API_BASE}/download.mp3?url=${encodeURIComponent(song.download.regular)}&filename=${encodeURIComponent(song.name)}`}
                        className="ncs-dl-btn"
                        onClick={(e) => e.stopPropagation()}
                        title="Download"
                      >
                        <Download size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {!loading && !searchQuery && !genreFilter && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button onClick={loadMore} className="ncs-btn outline">
              Load More
            </button>
          </div>
        )}
      </section>
      </>
      } />
      <Route path="/developers" element={<Developers />} />
      </Routes>

      <footer>
        <p>© 2026 Bento Music. All rights reserved.</p>
        <p>Author: <a href="https://github.com/atiqisrak" target="_blank" rel="noreferrer">Atiq Israk</a></p>
      </footer>

      {/* Global Player */}
      {currentSong && (
        <div className="ncs-player-fixed">
          <div className="ncs-player-info">
            <img src={currentSong.coverUrl || 'https://via.placeholder.com/50'} alt="Cover" />
            <div>
              <h4>{currentSong.name}</h4>
              <p>{currentSong.artists.map(a => a.name).join(', ')}</p>
            </div>
          </div>
          
          <div className="ncs-player-controls" style={{ flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <button onClick={playPrev}><SkipBack size={24} fill="currentColor" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
              </button>
              <button onClick={playNext}><SkipForward size={24} fill="currentColor" /></button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '400px', fontSize: '11px', color: '#888', fontWeight: 600 }}>
              <span>{formatTime(currentTime)}</span>
              <input 
                type="range" 
                min={0} max={duration || 100} step={0.1}
                value={currentTime}
                onChange={handleSeek}
                style={{ flex: 1, accentColor: 'var(--primary)', height: '4px' }}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="ncs-player-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#888' }}>
              <Volume2 size={20} />
              <input 
                type="range" 
                min={0} max={1} step={0.01} 
                value={volume} 
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ width: '80px', accentColor: '#fff' }}
              />
            </div>
          </div>

          <audio 
            ref={audioRef}
            src={currentSong.previewUrl}
            onEnded={playNext}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;
