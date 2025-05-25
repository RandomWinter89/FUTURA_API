const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');


// --- User's wishlist -------------------

// CREATE
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

// READ
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


// --- Wishlist's item -------------------

router.get('/users/:uid/wishlist/readItem', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT
                wc.user_id,
                wi.product_id
            FROM wishlist_cart wc
            JOIN wishlist_item wi ON wc.id = wi.wishlist_id
            WHERE wc.user_id = $1
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

// CREATE
router.post('/users/:uid/wishlist/addItem', async (req, res) => {
    const client = await pool.connect();
    const { uid  } = req.params;
    const { product_id, wishlist_id } = req.body;

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

// UPDATE (delete <--> add mode)
router.put('/users/:uid/wishlist/:product_id', async (req, res) => {
    const client = await pool.connect();
    const { uid, product_id } = req.params;

    try {
        const check = await client.query(`
            SELECT 
                wi.id,
                wi.wishlist_id,
                wi.product_id
            FROM wishlist_cart AS wc
            JOIN wishlist_item AS wi ON wi.wishlist_id = wc.id
            WHERE wc.user_id = $1 AND wi.product_id = $2
        `, [uid, product_id]);

        let message;
        if (check.rows.length > 0) {
            const deleted = await client.query(`
                DELETE FROM wishlist_item
                WHERE id = $1
                RETURNING *
            `, [check.rows[0].id]);

            message = deleted.rows[0];
        } else {
            const insert = await client.query(`
                INSERT INTO wishlist_item (wishlist_id, product_id)
                VALUES (
                    (SELECT id FROM wishlist_cart WHERE user_id = $1 LIMIT 1), 
                    $2
                )
                RETURNING *
            `, [uid, product_id]);

            message = insert.rows[0];
        }

        res.status(200).json(message);
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message,
            data: product_id
        })
    } finally {
        client.release();
    }
})

module.exports = router;