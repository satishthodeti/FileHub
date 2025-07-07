const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PG_USER || 'postgres', // Fallback to default user if not set
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'postgres',
  password: process.env.PG_PASSWORD, // Never hardcode passwords!
  port: process.env.PG_PORT || 5432,
});


module.exports = pool;
