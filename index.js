const express = require('express');
const cors = require('cors');

let app = express();
app.use(cors());
app.use(express.json());

const pool = require('./db/pool.js');

// ====== Database connection =====================================>

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

// ======= Routes =================================================>

const userRoutes = require('./routes/user');
app.use('/', userRoutes);

const cartRoutes = require('./routes/cart');
app.use('/', cartRoutes);

const addressRoutes = require('./routes/address');
app.use('/', addressRoutes);

const productRoutes = require('./routes/product');
app.use('/', productRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/', paymentRoutes);

const orderedRoutes = require('./routes/ordered');
app.use('/', orderedRoutes);

const wishlistRoutes = require('./routes/wishlist');
app.use('/', wishlistRoutes);

const reviewRoutes = require('./routes/review');
app.use('/', reviewRoutes);

const promotionRoutes = require('./routes/promotion');
app.use('/', promotionRoutes);

const stripeRoutes = require('./routes/stripe');
app.use('/api', stripeRoutes);

// ====== API Listen ==============================================>

app.get('/', (req, res) => {
    res.send('Welcome to the FUTURA API!');
});

app.listen(3000, () => {
    console.log("Server is running on port http://localhost:3000");
});
