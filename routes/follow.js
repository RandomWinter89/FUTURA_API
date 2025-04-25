const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

// ====== Follow ==============================================>

//Followers
router.get('/users/:id/followers', async (req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const result = await client.query(`
            SELECT * FROM followers 
                WHERE followed_user_id = $1 
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No followers found' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        })
    } finally {
        client.release();
    }
});

//Following
router.get('/users/:id/following', async (req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const result = await client.query(`
            SELECT * FROM followers 
                WHERE following_user_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No following found' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        })
    } finally {
        client.release();
    }
})

// Follow a user
router.post('/users/:id/following', async (req, res) => {
    const client = await pool.connect();
    const id = req.params.id;
    const { followed_id } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO followers (following_user_id, followed_user_id) 
                VALUES ($1, $2)
            RETURNING *
        `, [id, followed_id]);

        res.status(200).json({
            status: 'Success',
            message: 'User followed successfully',
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

// Unfollow a user
router.delete('/users/:id/following/:followed_id', async (req, res) => {
    const client = await pool.connect();
    const id = req.params.id;
    const followed_id = req.params.followed_id;

    try {
        const result = await client.query(`
            DELETE FROM followers 
                WHERE following_user_id = $1 AND followed_user_id = $2
            RETURNING *
        `, [id, followed_id]);

        res.status(200).json({
            status: 'Success',
            message: 'Following Cancelled successfully',
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