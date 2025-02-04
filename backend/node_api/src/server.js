const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const WebSocket = require('ws');
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const winston = require('winston');
require('dotenv').config();

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// Initialize Express app
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Database connection
const db = new sqlite3.Database('../../database/network_topology.db', (err) => {
    if (err) {
        logger.error('Database connection error:', err);
    } else {
        logger.info('Connected to SQLite database');
    }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// WebSocket connection handling
wss.on('connection', (ws) => {
    logger.info('New WebSocket connection');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            // Handle different message types
            switch (data.type) {
                case 'subscribe':
                    // Handle subscription to updates
                    break;
                case 'unsubscribe':
                    // Handle unsubscription
                    break;
                default:
                    logger.warn('Unknown message type:', data.type);
            }
        } catch (error) {
            logger.error('WebSocket message handling error:', error);
        }
    });

    ws.on('close', () => {
        logger.info('Client disconnected');
    });
});

// Routes
app.use('/api/devices', require('./routes/devices'));
app.use('/api/services', require('./routes/services'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/scan', require('./routes/scan'));

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        db.close((err) => {
            if (err) {
                logger.error('Error closing database:', err);
                process.exit(1);
            }
            logger.info('Database connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;