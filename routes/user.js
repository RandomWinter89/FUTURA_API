const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// ====== API routes ==============================================>



// Signup - Create a new user
router.post('/users/signup', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;
    const { username, email, phone, gender, birthdate } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO users (username, email, phone, gender, birth) 
                VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [id, username, email, phone, gender, birthdate]);

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



// READ(GET) - Specified user by Email (NEED STRICTER RULES)
router.get('/users/:email', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT * FROM users 
                WHERE email = $1
        `, [req.params.email]);

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
router.put('/users/:id', async (req, res) => {
    const client = await pool.connect();
    const id = req.params.id;
    const { username, phone, gender, birth } = req.body;

    try {
        const result = await client.query(`
            UPDATE users 
                SET username = $1, phone = $2, gender = $3, birth = $4 
                    WHERE id = $5
            RETURNING *
        `, [username, phone, gender, birth, id])

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
router.delete('/users/:id', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            DELETE FROM users
                WHERE id = $1
            RETURNING *
        `, [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            status: 'Success',
            message: 'User deleted successfully', 
            deletedData: result.rows[0]
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