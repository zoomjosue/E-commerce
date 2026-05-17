require('dotenv').config();

const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const { seedAdmin } = require('./controllers/authController');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/health', (_, res) => {
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    error: 'Error interno del servidor'
  });
});

app.listen(PORT, async () => {
  console.log(`Backend corriendo en puerto ${PORT}`);

  try {
    await seedAdmin();
    console.log('Admin verificado');
  } catch (e) {
    console.warn('Seed admin postponed:', e.message);
  }
});