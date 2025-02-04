const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, isAdmin } = require('../middleware/auth');
const logger = require('../utils/logger');

const db = new sqlite3.Database('../../../database/network_topology.db');

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            logger.error('Login error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        try {
            if (await bcrypt.compare(password, user.password_hash)) {
                const token = jwt.sign(
                    { id: user.id, username: user.username, role: user.role },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );

                // Update last login
                db.run('UPDATE users SET last_login = datetime("now") WHERE id = ?', [user.id]);

                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        role: user.role
                    }
                });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } catch (error) {
            logger.error('Password comparison error:', error);
            res.status(500).json({ error: 'Authentication error' });
        }
    });
});

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, (req, res) => {
    const sql = `
        SELECT id, username, role, last_login, created_at
        FROM users
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            logger.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Create new user (admin only)
router.post('/', authenticateToken, isAdmin, async (req, res) => {
    const { username, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = `
            INSERT INTO users (
                username, password_hash, role, created_at
            ) VALUES (?, ?, ?, datetime('now'))
        `;

        db.run(sql, [username, hashedPassword, role], function(err) {
            if (err) {
                logger.error('Error creating user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ 
                id: this.lastID,
                username,
                role
            });
        });
    } catch (error) {
        logger.error('Password hashing error:', error);
        res.status(500).json({ error: 'User creation failed' });
    }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
    const { username, password, role } = req.body;
    
    // Only admins can update other users or change roles
    if (req.user.id !== parseInt(req.params.id) && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        let updates = [];
        let params = [];

        if (username) {
            updates.push('username = ?');
            params.push(username);
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push('password_hash = ?');
            params.push(hashedPassword);
        }

        if (role && req.user.role === 'admin') {
            updates.push('role = ?');
            params.push(role);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        params.push(req.params.id);
        const sql = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = ?
        `;

        db.run(sql, params, function(err) {
            if (err) {
                logger.error('Error updating user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User updated successfully' });
        });
    } catch (error) {
        logger.error('User update error:', error);
        res.status(500).json({ error: 'Update failed' });
    }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, isAdmin, (req, res) => {
    // Prevent deleting the last admin
    db.get('SELECT COUNT(*) as count FROM users WHERE role = "admin"', [], (err, row) => {
        if (err) {
            logger.error('Error checking admin count:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row.count <= 1) {
            return res.status(400).json({ error: 'Cannot delete last admin user' });
        }

        db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
            if (err) {
                logger.error('Error deleting user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json({ message: 'User deleted successfully' });
        });
    });
});

// Change password (user can change their own password)
router.post('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        // Verify current password
        db.get('SELECT password_hash FROM users WHERE id = ?', [req.user.id], async (err, user) => {
            if (err) {
                logger.error('Error fetching user:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // Update to new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            db.run('UPDATE users SET password_hash = ? WHERE id = ?', 
                [hashedPassword, req.user.id], 
                function(err) {
                    if (err) {
                        logger.error('Error updating password:', err);
                        return res.status(500).json({ error: 'Password update failed' });
                    }
                    res.json({ message: 'Password updated successfully' });
                }
            );
        });
    } catch (error) {
        logger.error('Password change error:', error);
        res.status(500).json({ error: 'Password change failed' });
    }
});

module.exports = router;