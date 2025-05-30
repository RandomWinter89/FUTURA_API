const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Create Address with UID
router.post('/users/:uid/address', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;
    const { address_line1, address_line2, city, region, postal_code } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO address (user_id, address_line1, address_line2, city, region, postal_code) 
                VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [uid, address_line1, address_line2, city, region, postal_code]);

        res.json({
            status: 'Success',
            message: `User's address created successfully`,
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        })
    } finally {
        client.release();
    }
});

// GET All Address by UID
router.get('/users/:uid/address', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;

    try {
        const result = await client.query(`
            SELECT * FROM address WHERE user_id = $1
        `, [uid]);

        res.json({
            status: 'Success',
            message: `User's address retrieved successfully`,
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        })
    } finally {
        client.release();
    }
});

// Update Address by UID and Address ID
router.put('/users/:uid/address/:address_id', async (req, res) => {
    const client = await pool.connect();
    const { uid, address_id } = req.params;
    const { address_line1, address_line2, city, region, postal_code } = req.body;

    try {
        const result = await client.query(`
            UPDATE address 
                SET address_line1 = $1, address_line2 = $2, city = $3, region = $4, postal_code = $5
                    WHERE id = $6 AND user_id = $7
            RETURNING *
        `, [address_line1, address_line2, city, region, postal_code, address_id, uid]);

        res.json({
            status: 'Success',
            message: `User's address updated successfully`,
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        })
    } finally {
        client.release();
    }
});

module.exports = router;