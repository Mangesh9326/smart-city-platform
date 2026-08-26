require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { initializeSocket } = require('./engine/socketManager');
// const replayEngine = require('./engine/replayEngine'); // We will use this via an API route later
const authRoutes = require('./api/routes/authRoutes');
const simulationRoutes = require('./api/routes/simulationRoutes');
const mapRoutes = require('./api/routes/map');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Socket.IO
initializeSocket(server);

// Static file serving for simulated-incident scenario videos.
// simulationRoutes.js (at api/routes/simulationRoutes.js) creates and expects
// files at api/public/videos/<scenario id>.mp4, and returns just the filename
// as `video_file`. The frontend builds the playable URL as
// `http://localhost:5000/videos/<video_file>`, so this mount is what actually
// makes that URL resolve to a real file on disk.
app.use('/videos', express.static(path.join(__dirname, 'api/public/videos')));

// Static file serving for Live CCTV uploads (multer writes these to
// api/public/uploads/ — mounted here in case the frontend ever needs to
// preview an already-uploaded Live video directly from the server instead of
// its local blob URL).
app.use('/uploads', express.static(path.join(__dirname, 'api/public/uploads')));


// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/simulations', simulationRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/map', mapRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Online', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`[SYSTEM] Server initialized on port ${PORT}`);
    console.log(`[SYSTEM] Environment: ${process.env.NODE_ENV}`);
});