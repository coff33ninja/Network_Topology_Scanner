const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const WebSocket = require('ws');

const db = new sqlite3.Database('../../../database/network_topology.db');

// Start a new network scan
router.post('/start', authenticateToken, (req, res) => {
    const { location_id, scan_type = 'full' } = req.body;

    // Create scan record
    const sql = `
        INSERT INTO scan_history (
            location_id, scan_type, status, start_time
        ) VALUES (?, ?, 'running', datetime('now'))
    `;

    db.run(sql, [location_id, scan_type], function(err) {
        if (err) {
            logger.error('Error creating scan record:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        const scanId = this.lastID;

        // Notify Python scanner through WebSocket
        const ws = new WebSocket('ws://localhost:8765');
        ws.on('open', () => {
            ws.send(JSON.stringify({
                type: 'start_scan',
                data: {
                    scan_id: scanId,
                    location_id,
                    scan_type
                }
            }));
            ws.close();
        });

        res.json({ 
            scan_id: scanId,
            message: 'Scan started successfully' 
        });
    });
});

// Get scan status
router.get('/status/:scanId', authenticateToken, (req, res) => {
    const sql = `
        SELECT *
        FROM scan_history
        WHERE id = ?
    `;

    db.get(sql, [req.params.scanId], (err, scan) => {
        if (err) {
            logger.error('Error fetching scan status:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!scan) {
            return res.status(404).json({ error: 'Scan not found' });
        }
        res.json(scan);
    });
});

// Get scan history
router.get('/history', authenticateToken, (req, res) => {
    const { location_id, limit = 50, offset = 0 } = req.query;

    let sql = `
        SELECT sh.*, l.name as location_name
        FROM scan_history sh
        LEFT JOIN locations l ON sh.location_id = l.id
    `;
    let params = [];

    if (location_id) {
        sql += ' WHERE sh.location_id = ?';
        params.push(location_id);
    }

    sql += ` ORDER BY sh.start_time DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(sql, params, (err, rows) => {
        if (err) {
            logger.error('Error fetching scan history:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get scan results
router.get('/results/:scanId', authenticateToken, (req, res) => {
    const sql = `
        SELECT sh.*, 
               d.mac_address, d.ip_address, d.hostname,
               s.port, s.service_name
        FROM scan_history sh
        LEFT JOIN devices d ON sh.id = d.last_scan_id
        LEFT JOIN services s ON d.id = s.device_id
        WHERE sh.id = ?
    `;

    db.all(sql, [req.params.scanId], (err, rows) => {
        if (err) {
            logger.error('Error fetching scan results:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        // Group results by device
        const results = rows.reduce((acc, row) => {
            if (!acc[row.mac_address]) {
                acc[row.mac_address] = {
                    mac_address: row.mac_address,
                    ip_address: row.ip_address,
                    hostname: row.hostname,
                    services: []
                };
            }
            if (row.port && row.service_name) {
                acc[row.mac_address].services.push({
                    port: row.port,
                    service: row.service_name
                });
            }
            return acc;
        }, {});

        res.json(Object.values(results));
    });
});

// Cancel ongoing scan
router.post('/cancel/:scanId', authenticateToken, (req, res) => {
    db.get('SELECT status FROM scan_history WHERE id = ?', [req.params.scanId], (err, scan) => {
        if (err) {
            logger.error('Error fetching scan:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!scan) {
            return res.status(404).json({ error: 'Scan not found' });
        }
        if (scan.status !== 'running') {
            return res.status(400).json({ error: 'Scan is not running' });
        }

        // Notify Python scanner to cancel
        const ws = new WebSocket('ws://localhost:8765');
        ws.on('open', () => {
            ws.send(JSON.stringify({
                type: 'cancel_scan',
                data: { scan_id: parseInt(req.params.scanId) }
            }));
            ws.close();
        });

        // Update scan status
        db.run(
            'UPDATE scan_history SET status = "cancelled", end_time = datetime("now") WHERE id = ?',
            [req.params.scanId],
            function(err) {
                if (err) {
                    logger.error('Error cancelling scan:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Scan cancelled successfully' });
            }
        );
    });
});

module.exports = router;