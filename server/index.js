const express = require('express');
const bodyParser = require('body-parser');
const {
  pool,
  createTables,
  createCustomer,
  createRestaurant,
  fetchCustomers,
  fetchRestaurants,
  createReservation,
  destroyReservation,
} = require('./db');

const app = express();
app.use(bodyParser.json());

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await fetchCustomers();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/restaurants', async (req, res) => {
  try {
    const restaurants = await fetchRestaurants();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reservations', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reservations');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/customers/:id/reservations', async (req, res) => {
  const { id } = req.params;
  const { restaurant_id, date, party_count } = req.body;
  try {
    const reservation = await createReservation(date, party_count, restaurant_id, id);
    res.status(201).json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/customers/:customer_id/reservations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await destroyReservation(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

const init = async () => {
  try {
    await createTables();
    console.log('Tables created');
  } catch (error) {
    console.error('Error creating tables', error);
  }

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
};

init();
