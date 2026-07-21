const socketIo = require('socket.io');

let io;

const initializeSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: '*', // In production, restrict this to the frontend URL
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`[SOCKET] Client connected: ${socket.id}`);
        
        // The client can join specific rooms if they only want department data,
        // but the Unified Dashboard will listen to the global broadcast.
        socket.join('unified_dashboard');

        socket.on('disconnect', () => {
            console.log(`[SOCKET] Client disconnected: ${socket.id}`);
        });
    });

    console.log('[SYSTEM] Socket.IO Initialized for Real-Time Synchronization.');
};

// Functions to broadcast to specific frontend panels
const broadcastTrafficUpdate = (data) => {
    if (io) io.to('unified_dashboard').emit('TRAFFIC_UPDATE', data);
};

const broadcastHospitalUpdate = (data) => {
    if (io) io.to('unified_dashboard').emit('HOSPITAL_UPDATE', data);
};

const broadcastDecisionPlan = (plan) => {
    if (io) io.to('unified_dashboard').emit('DECISION_COMMAND', plan);
};

// Global tick broadcast for the Digital Twin / Map
const broadcastSystemTick = (timestamp, activeEvents, vehicles) => {
    if (io) io.to('unified_dashboard').emit('SYSTEM_TICK', { timestamp, activeEvents, vehicles });
};

module.exports = {
    initializeSocket,
    broadcastTrafficUpdate,
    broadcastHospitalUpdate,
    broadcastDecisionPlan,
    broadcastSystemTick
};