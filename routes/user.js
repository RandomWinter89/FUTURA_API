const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// === CREATE ==========

// AUTHSignup
router.post('/users/authSignup', async (req, res) => {
    const client = await pool.connect();
    const { uid, username, email} = req.body;

    try {
        const result = await client.query(`
            INSERT INTO users (uid, username, email) 
                VALUES ($1, $2, $3)
            RETURNING 
                username, email, phone, gender, birth, role
        `, [uid, username, email]);

        res.json({
            status: 'Success',
            message: 'User created successfully',
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

// DBSignup
router.post('/users/dbSignup', async (req, res) => {
    const client = await pool.connect();
    const {
        uid, username, email, phone, gender, birth
    } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO users (uid, username, email, phone, gender, birth) 
                VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING 
                username, email, phone, gender, birth, role
        `, [uid, username, email, phone, gender, birth]);

        res.json({
            status: 'Success',
            message: 'DBSignup - Create Success',
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


// === READ ========== 

router.get('/users/:uid/readUser', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                username, email, phone, gender, birth, role
            FROM users 
                WHERE uid = $1
        `, [req.params.uid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        })
    } finally {
        client.release();
    }
});

// === UPDATE ==========

router.put('/users/:uid/updateUser', async (req, res) => {
    const client = await pool.connect();
    const uid = req.params.uid;
    const { username, phone, gender, birth } = req.body;

    try {
        const result = await client.query(`
            UPDATE users 
                SET username = $1, phone = $2, gender = $3, birth = $4 
                    WHERE uid = $5
            RETURNING 
                username, email, phone, gender, birth, role
        `, [username, phone, gender, birth, uid])

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            status: 'Success',
            message: `User's profile updated successfully`, 
            updatedData: result.rows[0]
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


// === DELETE ==========

router.delete('/users/:uid/deleteUser', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            DELETE FROM users
                WHERE uid = $1
            RETURNING 
                username
        `, [req.params.uid]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            status: 'Success',
            message: 'User deleted successfully'
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