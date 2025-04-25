const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// ==============================
// shopping cart - create
router.post('/users/:id/cart', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;

    try {
        const result = await client.query(`
            INSERT INTO shopping_cart (user_id)
                VALUES ($1)
            RETURNING *
        `, [id]);

        res.json({
            status: 'Success',
            message: `User's client cart created successfully`,
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

// shopping cart - get cart by uid
router.get('/users/:id/cart', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;

    try {
        const result = await client.query(`
            SELECT * FROM shopping_cart WHERE user_id = $1
        `, [id, username, email, phone, gender, birthdate]);

        res.json({
            status: 'Success',
            message: 'Cart found successfully',
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

// ==============================

// cart item - add item
router.post('/cart/:cart_id/addProduct', async (req, res) => {
    const client = await pool.connect();
    const { cart_id } = req.params;
    const { product_item_id, quantity } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO shopping_cart_item (cart_id, product_item_id, quantity) 
                VALUES ($1, $2, $3)
            RETURNING *
        `, [cart_id, product_item_id, quantity]);

        res.json({
            status: 'Success',
            message: 'Item added to cart successfully',
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

// cart item - get all items by cart id
router.get('/cart/:cart_id/items', async (req, res) => {
    const client = await pool.connect();
    const { cart_id } = req.params;

    try {
        const result = await client.query(`
            SELECT * FROM shopping_cart_item WHERE cart_id = $1
        `, [cart_id]);

        res.json({
            status: 'Success',
            message: 'Items found successfully',
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

// cart item - update quantity
router.put('/cart/:cart_id/updateQuantity', async (req, res) => {
    const client = await pool.connect();
    const { cart_id } = req.params;
    const { product_item_id, quantity } = req.body;

    try {
        const result = await client.query(`
            UPDATE shopping_cart_item 
                SET quantity = $1 
                    WHERE cart_id = $2 AND product_item_id = $3
            RETURNING *
        `, [quantity, cart_id, product_item_id]);

        res.json({
            status: 'Success',
            message: 'Item quantity updated successfully',
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

// cart item - remove specified items
router.delete('/cart/:cart_id/removeProduct', async (req, res) => {
    const client = await pool.connect();
    const { cart_id } = req.params;
    const { product_item_ids } = req.body || {}; // Expecting an array of product_item_ids

    try {
        const result = await client.query(`
            DELETE FROM shopping_cart_item 
                WHERE cart_id = $1 AND product_item_id = ANY($2::int[]) 
            RETURNING *
        `, [cart_id, product_item_ids]);

        res.json({
            status: 'Success',
            message: 'Item remove from cart successfully',
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

// cart item - clear all items
router.delete('/cart/:cart_id/clear', async (req, res) => {
    const client = await pool.connect();
    const { cart_id } = req.params;

    try {
        const result = await client.query(`
            DELETE FROM shopping_cart_item 
                WHERE cart_id = $1
            RETURNING *
        `, [cart_id]);

        res.json({
            status: 'Success',
            message: 'All items removed from cart successfully',
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