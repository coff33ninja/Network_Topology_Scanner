const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const db = new sqlite3.Database('../../../database/network_topology.db');

// Get all locations
router.get('/', authenticateToken, (req, res) => {
    const sql = `
        SELECT l.*, COUNT(d.id) as device_count
        FROM locations l
        LEFT JOIN devices d ON l.id = d.location_id
        GROUP BY l.id
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            logger.error('Error fetching locations:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Get single location with devices
router.get('/:id', authenticateToken, (req, res) => {
    const locationSql = 'SELECT * FROM locations WHERE id = ?';
    const devicesSql = 'SELECT * FROM devices WHERE location_id = ?';
    
    db.get(locationSql, [req.params.id], (err, location) => {
        if (err) {
            logger.error('Error fetching location:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        
        db.all(devicesSql, [req.params.id], (err, devices) => {
            if (err) {
                logger.error('Error fetching location devices:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({
                ...location,
                devices
            });
        });
    });
});

// Create new location
router.post('/', authenticateToken, (req, res) => {
    const {
        name,
        description,
        network_range
    } = req.body;

    const sql = `
        INSERT INTO locations (
            name, description, network_range, created_at
        ) VALUES (?, ?, ?, datetime('now'))
    `;

    db.run(sql, [
        name,
        description,
        network_range
    ], function(err) {
        if (err) {
            logger.error('Error creating location:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Update location
router.put('/:id', authenticateToken, (req, res) => {
    const {
        name,
        description,
        network_range
    } = req.body;

    const sql = `
        UPDATE locations
        SET name = ?,
            description = ?,
            network_range = ?
        WHERE id = ?
    `;

    db.run(sql, [
        name,
        description,
        network_range,
        req.params.id
    ], function(err) {
        if (err) {
            logger.error('Error updating location:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json({ message: 'Location updated successfully' });
    });
});

// Delete location
router.delete('/:id', authenticateToken, (req, res) => {
    // First check if location has any devices
    db.get('SELECT COUNT(*) as count FROM devices WHERE location_id = ?', [req.params.id], (err, row) => {
        if (err) {
            logger.error('Error checking location devices:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (row.count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete location with associated devices' 
            });
        }

        // If no devices, proceed with deletion
        db.run('DELETE FROM locations WHERE id = ?', [req.params.id], function(err) {
            if (err) {
                logger.error('Error deleting location:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Location not found' });
            }
            res.json({ message: 'Location deleted successfully' });
        });
    });
});

module.exports = router;