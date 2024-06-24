const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'acme_reservation_planner',
  password: 'password',
  port: 5432,
});

const createTables = async () => {
  await pool.query(`
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS restaurants;

    CREATE TABLE customers (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE restaurants (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    );

    CREATE TABLE reservations (
      id UUID PRIMARY KEY,
      date DATE NOT NULL,
      party_count INTEGER NOT NULL,
      restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
      customer_id UUID REFERENCES customers(id) NOT NULL
    );
  `);
};

const createCustomer = async (name) => {
  const id = uuidv4();
  const result = await pool.query(
    'INSERT INTO customers (id, name) VALUES ($1, $2) RETURNING *',
    [id, name]
  );
  return result.rows[0];
};

const createRestaurant = async (name) => {
  const id = uuidv4();
  const result = await pool.query(
    'INSERT INTO restaurants (id, name) VALUES ($1, $2) RETURNING *',
    [id, name]
  );
  return result.rows[0];
};

const fetchCustomers = async () => {
  const result = await pool.query('SELECT * FROM customers');
  return result.rows;
};

const fetchRestaurants = async () => {
  const result = await pool.query('SELECT * FROM restaurants');
  return result.rows;
};

const createReservation = async (date, party_count, restaurant_id, customer_id) => {
  const id = uuidv4();
  const result = await pool.query(
    'INSERT INTO reservations (id, date, party_count, restaurant_id, customer_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [id, date, party_count, restaurant_id, customer_id]
  );
  return result.rows[0];
};

const destroyReservation = async (id) => {
  await pool.query('DELETE FROM reservations WHERE id = $1', [id]);
};

module.exports = {
  pool,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation,
};
