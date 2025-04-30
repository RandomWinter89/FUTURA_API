const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// ====== API routes ==============================================>



// Signup - Create a new user
router.post('/users/signup', async (req, res) => {
    const client = await pool.connect();
    const { uid, username, email} = req.body;

    try {
        const result = await client.query(`
            INSERT INTO users (uid, username, email) 
                VALUES ($1, $2, $3)
            RETURNING *
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



// READ(GET) - All Users (Name, Gender)
router.get('/users/', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT * FROM users');

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        })
    } finally {
        client.release();
    }
});



// READ(GET) - Specified user by Email (NEED STRICTER RULES) //Uid
router.get('/users/:uid', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT * FROM users 
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


// UPDATE(PUT) - Update a user by ID
router.put('/users/:uid', async (req, res) => {
    const client = await pool.connect();
    const uid = req.params.uid;
    const { username, phone, gender, birth } = req.body;

    try {
        const result = await client.query(`
            UPDATE users 
                SET username = $1, phone = $2, gender = $3, birth = $4 
                    WHERE uid = $5
            RETURNING *
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



// DELETE - Delete user by Email
router.delete('/users/:uid', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            DELETE FROM users
                WHERE uid = $1
            RETURNING *
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