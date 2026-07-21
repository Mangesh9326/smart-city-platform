require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
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


// Routes
app.use('/api/auth', authRoutes);
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