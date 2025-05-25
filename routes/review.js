const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

// ====== Review Method ==============================================>

//Create Review 
router.post('/users/:uid/review', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;
    const { product_id, comment, rating_value } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO user_review (created_by_userid, product_id, created_datetime, comment, rating_value)
                VALUES ($1, $2, NOW(), $3, $4)
            RETURNING *
        `, [uid, product_id, comment, rating_value]);

        res.json({
            status: 'Success',
            message: `User's review created successfully`,
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


//Get All Review by UserID
router.get('/users/:uid/review', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;

    try {
        const result = await client.query(`
            SELECT * FROM user_review WHERE created_by_userid = $1
        `, [id]);

        res.json({
            status: 'Success',
            message: 'Review found successfully',
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


//Get All Review by ProductID
router.get('/products/:id/review', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;

    try {
        const result = await client.query(`
            SELECT 
                u.username,
                ur.created_datetime,
                ur.comment,
                ur.rating_value,
                ur.created_by_userid
            FROM user_review as ur
                JOIN users as u on u.uid = created_by_userid
            WHERE ur.product_id = $1
        `, [id]);

        res.json({
            status: 'Success',
            message: 'Review found successfully',
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


//Delete Review by ProductID and UserID
router.delete('users/:uid/review/:review_id', async (req, res) => {
    const client = await pool.connect();
    const { uid, review_id } = req.params;

    try {
        const result = await client.query(`
            DELETE FROM user_review 
                WHERE created_by_userid = $1 AND id = $2
            RETURNING *
        `, [uid, review_id]);

        res.json({
            status: 'Success',
            message: 'Review deleted successfully',
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


//Update Review by userID and reviewID
router.put('users/:uid/review/:review_id', async (req, res) => {
    const client = await pool.connect();
    const { uid, review_id } = req.params;
    const { rating_value, comment } = req.body;

    try {
        const result = await client.query(`
            UPDATE user_review 
                SET rating_value = $1, comment = $2 
                    WHERE created_by_userid = $3 AND id = $4
            RETURNING *
        `, [rating_value, comment, uid, review_id]);

        res.json({
            status: 'Success',
            message: 'Review updated successfully',
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