const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.run.app') || origin.endsWith('.onrender.com')) {
      cb(null, true);
    } else {
      cb(new Error('CORS not allowed for CRM'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/crm/auth', require('./routes/auth'));
app.use('/api/crm', require('./routes/crm'));

// Health check
app.get('/api/crm/health', (req, res) => res.json({ status: 'ok', message: 'Next Level CRM API is running' }));

const PORT = process.env.PORT || 5050;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Next Level CRM API running on port ${PORT}`);
  console.log(`📊 Connected to Shared Database\n`);
});
