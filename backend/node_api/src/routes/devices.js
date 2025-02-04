const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const db = new sqlite3.Database('../../../database/network_topology.db');

// Get all devices
router.get('/', authenticateToken, (req, res) => {
    const sql = `
        SELECT d.*, l.name as location_name, 
               GROUP_CONCAT(s.port || ':' || s.service_name) as services
        FROM devices d
        LEFT JOIN locations l ON d.location_id = l.id
        LEFT JOIN services s ON d.id = s.device_id
        GROUP BY d.id
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            logger.error('Error fetching devices:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows.map(row => ({
            ...row,
            services: row.services ? row.services.split(',').map(s => {
                const [port, service] = s.split(':');
                return { port, service };
            }) : []
        })));
    });
});

// Get single device
router.get('/:id', authenticateToken, (req, res) => {
    const sql = `
        SELECT d.*, l.name as location_name,
               GROUP_CONCAT(s.port || ':' || s.service_name) as services
        FROM devices d
        LEFT JOIN locations l ON d.location_id = l.id
        LEFT JOIN services s ON d.id = s.device_id
        WHERE d.id = ?
        GROUP BY d.id
    `;
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            logger.error('Error fetching device:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json({
            ...row,
            services: row.services ? row.services.split(',').map(s => {
                const [port, service] = s.split(':');
                return { port, service };
            }) : []
        });
    });
});

// Create new device
router.post('/', authenticateToken, (req, res) => {
    const {
        mac_address,
        ip_address,
        hostname,
        device_type,
        location_id
    } = req.body;

    const sql = `
        INSERT INTO devices (
            mac_address, ip_address, hostname, device_type, location_id,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;

    db.run(sql, [
        mac_address,
        ip_address,
        hostname,
        device_type,
        location_id
    ], function(err) {
        if (err) {
            logger.error('Error creating device:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Update device
router.put('/:id', authenticateToken, (req, res) => {
    const {
        mac_address,
        ip_address,
        hostname,
        device_type,
        location_id
    } = req.body;

    const sql = `
        UPDATE devices
        SET mac_address = ?,
            ip_address = ?,
            hostname = ?,
            device_type = ?,
            location_id = ?,
            updated_at = datetime('now')
        WHERE id = ?
    `;

    db.run(sql, [
        mac_address,
        ip_address,
        hostname,
        device_type,
        location_id,
        req.params.id
    ], function(err) {
        if (err) {
            logger.error('Error updating device:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json({ message: 'Device updated successfully' });
    });
});

// Delete device
router.delete('/:id', authenticateToken, (req, res) => {
    db.run('DELETE FROM devices WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            logger.error('Error deleting device:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json({ message: 'Device deleted successfully' });
    });
});

// Wake on LAN
router.post('/:id/wake', authenticateToken, (req, res) => {
    db.get('SELECT mac_address FROM devices WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            logger.error('Error fetching device for WoL:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(404).json({ error: 'Device not found' });
        }

        // Implement Wake on LAN logic here
        try {
            // TODO: Implement actual WoL functionality
            logger.info(`Sending WoL packet to ${row.mac_address}`);
            res.json({ message: 'Wake on LAN signal sent' });
        } catch (error) {
            logger.error('Error sending WoL packet:', error);
            res.status(500).json({ error: 'Failed to send Wake on LAN signal' });
        }
    });
});

module.exports = router;