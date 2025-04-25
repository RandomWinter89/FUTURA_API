const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

// ====== Promotion ==============================================>

router.get('/promotion/category', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT * FROM promotion_category
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No promotions found in category' });
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

router.get('/promotion', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT * FROM promotion WHERE end_date >= CURRENT_DATE
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No promotion' });
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


module.exports = router;