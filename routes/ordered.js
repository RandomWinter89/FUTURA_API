const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// --- USER'S ORDER --------------------------->

// create user's order id
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

// read user's order id
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


// --- ORDER'S ITEM ---------------------------->

// Create items to user's order
router.post('/order/:order_id', async (req, res) => {

    const client = await pool.connect();
    const { order_id } = req.params;
    const items = req.body;

    if (!Array.isArray(items) || items.length == 0) {
        return res.status(400).json({
            error: "Bad Request",
            message: "Request body must be a non-empty array of items."
        });
    }
    
    try {
        const values = [];
        const placeholders = items.map((item, index) => {
            const baseIndex = index * 5;
            values.push(
                item.product_id,
                order_id,
                item.quantity,
                item.price,
                item.product_variation_id
            );

            return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5})`;
        }).join(", ");

        const result = await client.query(`
            INSERT INTO ordered_item (product_id, order_id, quantity, price, product_variation_id)
            VALUES ${placeholders}
        `, values);

        res.json({
            status: "Success",
            message: `${result.rowCount} order item(s) created successfully`
        })
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        })
    } finally {
        client.release();
    }
    
});

// Read 
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

router.get('/user/:uid/order/items', async (req, res) => {
    const client = await pool.connect();
    const { uid } = req.params;

    try {
        const result = await client.query(`
            SELECT
                uo.id,
                p.name,
                oi.product_id,
                oi.quantity,
                oi.price,
                vo1.value AS value1,
                v1.name AS name1,
                vo2.value AS value2,
                v2.name AS name2
            FROM user_order AS uo
                JOIN ordered_item AS oi ON oi.order_id = uo.id
                JOIN product AS p ON p.id = oi.product_id
                JOIN product_variation AS pv ON pv.id = oi.product_variation_id
                LEFT JOIN variation_option AS vo1 ON vo1.id = pv.variation_option_id
                    LEFT JOIN variation AS v1 ON v1.id = vo1.variation_id
                LEFT JOIN variation_option AS vo2 ON vo2.id = pv.variation_option_2_id
                 LEFT JOIN variation AS v2 ON v2.id = vo2.variation_id
            WHERE uo.user_id = $1
        `, [uid])

        res.json({
            status: 'Success',
            message: `Order item created successfully`,
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



module.exports = router;