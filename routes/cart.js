const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// --- USER'S CART ------------------------------>
// shopping cart - create
router.post('/users/:uid/cart', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;

    try {
        const result = await client.query(`
            INSERT INTO shopping_cart (user_id)
                VALUES ($1)
            RETURNING *
        `, [uid]);

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
router.get('/users/:uid/cart', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;

    try {
        const result = await client.query(`
            SELECT * FROM shopping_cart WHERE user_id = $1
        `, [uid]);

        res.json({
            status: 'Success',
            message: 'Cart found successfully',
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

// id <-- connect to user's cart
// user_id

// --- CART'S ITEM ------------------------------>

// Create item to user's cart
router.post('/cart/:cart_id/addProduct', async (req, res) => {
    const client = await pool.connect();
    const { cart_id } = req.params;
    const { product_id, product_variation_id, quantity } = req.body;

    try {
        const result = await client.query(`
            WITH inserted AS (
                INSERT INTO shopping_cart_item (cart_id, product_id, product_variation_id, quantity) 
                VALUES ($1, $2, $3, $4)
                RETURNING *
            )
            SELECT
                ci.id,
                ci.quantity,
                p.id AS product_id,
                p.name,
                p.base_price,
                p.sku,
                pv.id AS product_variation_id,
                pv.extra_charge,
                vo1.value AS value1,
                v1.name AS name1,
                vo2.value AS value2,
                v2.name AS name2
            FROM inserted AS ci
                JOIN product AS p 
                    ON p.id = ci.product_id
                JOIN product_variation AS pv
                    ON pv.id = ci.product_variation_id
                LEFT JOIN variation_option AS vo1
                    ON vo1.id = pv.variation_option_id
                LEFT JOIN variation AS v1
                    ON v1.id = vo1.variation_id
                LEFT JOIN variation_option AS vo2
                    ON vo2.id = pv.variation_option_2_id
                LEFT JOIN variation AS v2
                    ON v2.id = vo2.variation_id;
        `, [cart_id, product_id, product_variation_id, quantity]);

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

// Read items from user's cart
router.get('/cart/:cart_id/items', async (req, res) => {
    const client = await pool.connect();
    const { cart_id } = req.params;

    try {
        const result = await client.query(`
            SELECT
                ci.id,
                ci.quantity,
                p.id as product_id,
                p.name,
                p.base_price,
                p.sku,
                pv.id as product_variation_id,
                pv.extra_charge,
                vo1.value as value1,
                v1.name as name1,
                vo2.value as value2,
                v2.name as name2
            FROM shopping_cart_item AS ci
                JOIN product AS p 
                    ON p.id = ci.product_id

                JOIN product_variation AS pv
                    ON pv.id = ci.product_variation_id

                LEFT JOIN variation_option as vo1
                    ON vo1.id = pv.variation_option_id

                    LEFT JOIN variation as v1
                        ON v1.id = vo1.variation_id

                LEFT JOIN variation_option as vo2
                    ON vo2.id = pv.variation_option_2_id

                    LEFT JOIN variation as v2
                        ON v2.id = vo2.variation_id

            WHERE ci.cart_id = $1;
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

// Update item's quantity from user's cart
router.put('/cart/:cart_id/updateQuantity', async (req, res) => {
    const client = await pool.connect();
    const { cart_id } = req.params;
    const { product_id, product_variation_id, quantity } = req.body;

    try {
        const result = await client.query(`
            UPDATE shopping_cart_item 
                SET quantity = $1 
                    WHERE cart_id = $2 AND product_id = $3 AND product_variation_id = $4
            RETURNING *
        `, [quantity, cart_id, product_id, product_variation_id]);

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

// Remove specified item from user's cart
router.delete('/cart/:cart_id/removeProduct', async (req, res) => {
    const client = await pool.connect();
    const { cart_id } = req.params;
    const { product_id, product_variation_id } = req.body || {};

    try {
        const result = await client.query(`
            DELETE FROM shopping_cart_item 
                WHERE cart_id = $1 AND product_id = $2 AND product_variation_id = $3
            RETURNING *
        `, [cart_id, product_id, product_variation_id]);

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

// Remove all item from user's cart
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
            message: 'All items removed from cart successfully'
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

// id 
// cart_id
// quantity
// product_id
    // name
    // 

// product_variation_id
    // product_variation - color
    // product_variation - size


module.exports = router;