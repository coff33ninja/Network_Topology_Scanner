const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const db = new sqlite3.Database('../../../database/network_topology.db');

// Get all services
router.get('/', authenticateToken, (req, res) => {
    const sql = `
        SELECT s.*, d.hostname, d.ip_address
        FROM services s
        LEFT JOIN devices d ON s.device_id = d.id
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            logger.error('Error fetching services:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get services for specific device
router.get('/device/:deviceId', authenticateToken, (req, res) => {
    const sql = `
        SELECT *
        FROM services
        WHERE device_id = ?
    `;
    
    db.all(sql, [req.params.deviceId], (err, rows) => {
        if (err) {
            logger.error('Error fetching device services:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Create new service
router.post('/', authenticateToken, (req, res) => {
    const {
        device_id,
        port,
        protocol,
        service_name,
        is_active
    } = req.body;

    const sql = `
        INSERT INTO services (
            device_id, port, protocol, service_name, is_active, last_checked
        ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;

    db.run(sql, [
        device_id,
        port,
        protocol,
        service_name,
        is_active
    ], function(err) {
        if (err) {
            logger.error('Error creating service:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Update service
router.put('/:id', authenticateToken, (req, res) => {
    const {
        port,
        protocol,
        service_name,
        is_active
    } = req.body;

    const sql = `
        UPDATE services
        SET port = ?,
            protocol = ?,
            service_name = ?,
            is_active = ?,
            last_checked = datetime('now')
        WHERE id = ?
    `;

    db.run(sql, [
        port,
        protocol,
        service_name,
        is_active,
        req.params.id
    ], function(err) {
        if (err) {
            logger.error('Error updating service:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service updated successfully' });
    });
});

// Delete service
router.delete('/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM services WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            logger.error('Error deleting service:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json({ message: 'Service deleted successfully' });
    });
});

module.exports = router;