const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

// ====== Wishlist ==============================================>

router.post('/users/:uid/wishlist', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;

    try {
        const result = await client.query(`
            INSERT INTO wishlist_cart (user_id)
                VALUES ($1)
            RETURNING *
        `, [uid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No products' });
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

router.get('/users/:uid/wishlist', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;

    try {
        const result = await client.query(`
            SELECT id FROM wishlist_cart WHERE user_id = $1
        `, [uid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No products' });
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

// ====== Wishlist Item ==============================================>

router.get('/users/:uid/wishlist', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT
                wc.user_id,
                wi.product_id
            FROM wishlist_cart wc
            JOIN wishlist_item wi ON wc.id = wi.wishlist_id
                WHERE wc.user_id = $1
            RETURNING *
        `, [req.params.uid]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No products' });
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

router.post('/users/:uid/wishlist/:product_id', async (req, res) => {
    const client = await pool.connect();
    const { uid, product_id } = req.params;
    const { wishlist_id } = req.body;

    try {
        // Check if the wishlist exists for the user
        const wishlistResult = await client.query(`
            SELECT * FROM wishlist_cart WHERE user_id = $1
        `, [uid]);

        if (wishlistResult.rows.length === 0) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        const result = await client.query(`
            INSERT INTO wishlist_item (wishlist_id, product_id)
                VALUES ($1, $2)
            RETURNING *
        `, [wishlist_id, product_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No products' });
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

router.delete('/users/:uid/wishlist/:product_id', async (req, res) => {
    const client = await pool.connect();
    const { uid, product_id } = req.params;
    const { wishlist_id } = req.body;

    try {
        // Check if the wishlist exists for the user
        const wishlistResult = await client.query(`
            SELECT * FROM wishlist_cart WHERE user_id = $1
        `, [uid]);

        if (wishlistResult.rows.length === 0) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        const result = await client.query(`
            DELETE FROM wishlist_item
                WHERE wishlist_id = $1 AND product_id = $2
            RETURNING *
        `, [wishlist_id, product_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No products' });
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


module.exports = router;