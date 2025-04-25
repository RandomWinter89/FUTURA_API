const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

// ====== Payment Method ==============================================>

//Get All Payment Method by UserID
router.get('/users/:id/payment', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;

    try {
        const result = await client.query(`
            SELECT * FROM payment_method WHERE user_id = $1
        `, [id]);

        res.json({
            status: 'Success',
            message: 'Payment method found successfully',
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


//Create Payment Method for UserID
router.post('/users/:id/payment', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;
    const { payment_type, provider, account_number, expiry_date, is_default } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO payment_method (user_id, payment_type, provider, account_number, expiry_date, is_default)
                VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [id, payment_type, provider, account_number, expiry_date, is_default]);

        res.json({
            status: 'Success',
            message: `User's payment method created successfully`,
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


//Update Payment Method for UserID
router.put('/users/:id/payment/:paymentId', async (req, res) => {
    const client = await pool.connect();
    const { id, paymentId } = req.params;
    const { payment_type, provider, account_number, expiry_date, is_default } = req.body;

    try {
        const result = await client.query(`
            UPDATE payment_method
                SET payment_type = $1, provider = $2, account_number = $3, expiry_date = $4, is_default = $5
                WHERE user_id = $6 AND id = $7
            RETURNING *
        `, [payment_type, provider, account_number, expiry_date, is_default, id, paymentId]);

        res.json({
            status: 'Success',
            message: `User's payment method updated successfully`,
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


//Delete Payment Method for UserID
router.delete('/users/:id/payment/:paymentId', async (req, res) => {
    const client = await pool.connect();
    const { id, paymentId } = req.params;

    try {
        const result = await client.query(`
            DELETE FROM payment_method WHERE user_id = $1 AND id = $2
        `, [id, paymentId]);

        res.json({
            status: 'Success',
            message: `User's payment method deleted successfully`,
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