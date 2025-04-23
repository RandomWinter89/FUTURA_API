const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

require('dotenv').config();
const { DATABASE_URL } = process.env;

let app = express();
app.use(cors());
app.use(express.json());



// ====== Database connection =====================================>



const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        require: true,
    }
});

async function getPostgresVersion() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT version()');
        console.log("Postgres Version: ", res.rows[0]);
    } finally {
        client.release();
    }
};

getPostgresVersion();



// ====== API routes ==============================================>



// Signup - Create a new user
app.post('/users/signup', async (req, res) => {
    const client = await pool.connect();
    const { id } = req.params;
    const { username, email, phone, gender, birthdate } = req.body;

    try {
        const result = await client.query(
            `INSERT INTO users (username, email, phone, gender, birth) VALUES ($1, $2, $3, $4, $5)`
        , [id, username, email, phone, gender, birthdate]);

    } catch (err) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: err.message
        })
    } finally {
        client.release();
    }
});



// READ(GET) - All users
app.get('/users/', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT * FROM users');
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



// READ(GET) - Specified user by Email
app.get('/users/:email', async (req, res) => {
    const client = await pool.connect();
    const { email } = req.params;

    try {
        const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
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



// UPDATE(PUT) - Update a user by ID
app.put('/users/:id', async (req, res) => {
    const client = await pool.connect();
    const id = req.params.id;
    const { username, phone, gender, birth } = req.body;

    try {
        const result = await client.query(`
            UPDATE users
                SET username = $1, phone = $2, gender = $3, birth = $4
                    WHERE id = $5
            RETURNING *
        `, [username, phone, gender, birth, id])

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            status: 'Success',
            message: `User's profile updated successfully`, 
            updatedData: result.rows[0]
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



// DELETE - Delete user by Email
app.delete('/users/:id', async (req, res) => {
    const client = await pool.connect();

    try {
        const result = await client.query(`
            DELETE FROM users
                WHERE id = $1
            RETURNING *
        `, [req.params.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            status: 'Success',
            message: 'User deleted successfully', 
            deletedData: result.rows[0]
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



// ====== Follow ==============================================>


    
// ====== API Listen ==============================================>

app.get('/', (req, res) => {
    res.send('Welcome to the FUTURA API!');
});

app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
});
