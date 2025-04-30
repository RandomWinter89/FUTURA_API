const express = require('express');
const router = express.Router();
const pool = require('../db/pool.js');

// == Product ==============================================>


// Get All Products
router.get('/products', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT * FROM product 
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

// Get Product Categories (Suitable? for product categories)
router.get('/products/category/:category_id', async (req, res) => {
    const client = await pool.connect();
    const {category_id} = req.params.id;

    try {
        const result = await client.query(`
            SELECT * FROM product 
                WHERE category_id = $1
        `, [category_id]);

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


// == Product Variation ==============================================>

// Get Product's Variation
router.get('/products/:id', async (req, res) => {
    const client = await pool.connect();
    const id = req.params.id;

    try {
        const result = await client.query(`
            SELECT * FROM product_variation 
                WHERE product_id = $1 
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No product item - found' });
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

// // Get Product's Variation Choices
// router.get('/products/:id/variation', async (req, res) => {
//     const client = await pool.connect();
//     const id = req.params.id;

//     try {
//         const result = await client.query(`
//             SELECT 
//                 pv.product_id,
//                 vo.id AS variation_option_id,
//                 vo.value AS variation_option_value,
//                 vo.extra_charge,
//                 v.id AS variation_id,
//                 v.name AS variation_name
//             FROM product_variation AS pv
//             JOIN variation_option AS vo ON pv.variation_option_id = vo.id
//             JOIN variation AS v ON vo.variation_id = v.id
//             WHERE pv.product_item_id = $1
//         `, [id]);

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'No product configuration - found' });
//         }

//         res.status(200).json(result.rows);
//     } catch (err) {
//         res.status(500).json({
//             error: 'Internal Server Error',
//             message: err.message
//         })
//     } finally {
//         client.release();
//     }
// });

// Get Variation
router.get('/products/variations', async (req, res) => {
    const client = await pool.connect();

    try {
        // const result = await client.query(`
        //     SELECT * FROM variation_option
        //         WHERE variation_id = $1 
        // `, [variation_id]);
        const result = await client.query(`
            SELECT 
                vo.id as variation_option_id,
                va.name as name,
                vo.value as value,
            FROM variation_option as vo
            JOIN variation as v ON vo.variation_id = v.id
        `, []);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No variation - found' });
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
})


// == Category ==============================================>

// Get Category
router.get('/categories', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT * FROM product_categories
        `);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No categories' });
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