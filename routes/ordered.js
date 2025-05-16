const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// ==============================
// Create user's order
router.post('/users/:uid/order', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;
    const { shipping_address_id, shipping_method, order_total, order_status } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO user_order (user_id, order_date, shipping_address_id, shipping_method, order_total, order_status)
                VALUES ($1, NOW(), $2, $3, $4, $5)
            RETURNING *
        `, [uid, shipping_address_id, shipping_method, order_total, order_status]);

        res.json({
            status: 'Success',
            message: `User order created successfully`,
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


// Get order by user id
router.get('/users/:uid/order', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;

    try {
        const result = await client.query(`
            SELECT * FROM user_order WHERE user_id = $1
        `, [uid]);

        res.json({
            status: 'Success',
            message: 'Order found successfully',
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


// Create order item by order id
router.post('/order/:order_id', async (req, res) => {
    const client = await pool.connect();
    const { order_id } = req.params;
    const { product_id, quantity, price, product_variation_id } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO ordered_item (product_id, order_id, quantity, price, product_variation_id) 
                VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [product_id, order_id, quantity, price, product_variation_id]);

        res.json({
            status: 'Success',
            message: `Order item created successfully`,
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


// Get order item by order id
router.get('/order/:order_id', async (req, res) => {
    const client = await pool.connect();
    const { order_id } = req.params;

    try {
        const result = await client.query(`
            SELECT * FROM ordered_item WHERE order_id = $1
        `, [order_id]);

        res.json({
            status: 'Success',
            message: 'Order item found successfully',
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

router.get('/orders', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                uo.id,
                uo.order_date,
                uo.shipping_method,
                uo.order_total,
                uo.order_status,
                u.username as name,
                a.address_line1,
                a.address_line2,
                a.city,
                a.region,
                a.postal_code
            FROM user_order as uo
                JOIN users as u on u.uid = uo.user_id
                JOIN address as a on a.id = uo.shipping_address_id
        `, []);

        res.json({
            status: 'Success',
            message: 'All Orders are extracted',
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
})

router.put('/order/:order_id', async (req, res) => {
    const client = await pool.connect();
    const {order_id} = req.params;
    const {status} = req.body

    try {
        const result = await client.query(`
            UPDATE user_order 
                SET order_status = $1
            WHERE id = $2
            RETURNING *
        `, [status, order_id]);

        res.json({
            status: 'Success',
            message: 'Update Order Status',
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
})



module.exports = router;