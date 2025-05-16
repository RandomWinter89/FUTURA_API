const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

// == Fetch Product ==============================================>
router.get('/products', async (req, res) => {
    const client = await pool.connect();

    try {
        // SELECT * FROM product
        const result = await client.query(`
            SELECT 
                p.id, 
                p.category_id, 
                p.name, 
                p.description, 
                p.base_price, 
                p.sku, 
                p.created_date,
                COUNT(r.id) AS number_of_reviews,
                AVG(r.rating_value) AS average_rating
            FROM product as p
            LEFT JOIN user_review r ON p.id = r.product_id
            GROUP by p.id, p.category_id, p.name, p.description, p.base_price, p.sku, p.created_date
        `);

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


// == Create Product =================================================>
router.post('/products', async (req, res) => {
    const client = await pool.connect();
    const {
        category_id,
        name,
        description,
        base_price,
        sku
    } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO product (category_id, name, description, base_price, sku, created_date)
                VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING *
        `, [category_id, name, description, base_price, sku]);

        res.json({
            status: 'Success',
            message: `Product is created`,
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

// == Create Product Variation =============================================>
router.post('/products/:id/variations', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;
    const {
        optionA_id,
        optionB_id,
        quantity,
        charge
    } = req.body;

    try {
        const result = await client.query(`
            INSERT INTO product_variation (product_id, variation_option_id, variation_option_2_id, quantity, extra_charge)
                VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [id, optionA_id, optionB_id, quantity, charge]);

        res.json({
            status: 'Success',
            message: `Product Variation is created`,
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

// == Update Product Variation ======
router.put('/products/:id/variations', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;
    const { quantity } = req.body;

    try {
        const result = await client.query(`
            UPDATE product_variation
                SET quantity = $2
            WHERE id = $1
            RETURNING *
        `, [id, quantity]);

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

// == Fetch Product Variation ==============================================>

// Get Variation Option
router.get('/products/variations', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT 
                vo.id as variation_option_id,
                v.name as name,
                vo.value as value
            FROM variation_option as vo
            JOIN variation as v ON vo.variation_id = v.id
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No variation - found' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error - from variations',
            message: err.message
        })
    } finally {
        client.release();
    }
})

// Get Variation
router.get('/products/variation/:id', async (req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const result = await client.query(`
            SELECT
                pv.id,
                pv.product_id,
                pv.quantity,
                pv.extra_charge,
                vo1.value as value1,
                v1.name as name1,
                vo2.value as value2,
                v2.name as name2
            FROM product_variation as pv 
                LEFT JOIN variation_option as vo1
                    ON vo1.id = pv.variation_option_id
                    LEFT JOIN variation as v1
                        ON v1.id = vo1.variation_id

                LEFT JOIN variation_option as vo2
                    ON vo2.id = pv.variation_option_2_id

                    LEFT JOIN variation as v2
                        ON v2.id = vo2.variation_id
            WHERE pv.product_id = $1 
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No product item - found' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error - from id',
            message: err.message
        })
    } finally {
        client.release();
    }
});




module.exports = router;