const { Pool } = require('pg');
require('dotenv').config();
const { DATABASE_URL } = process.env;


const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        require: true,
    }
});

module.exports = pool;