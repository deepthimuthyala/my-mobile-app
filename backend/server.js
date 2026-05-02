const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Log every incoming request
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});

// Test route - call this first to confirm backend reachable
app.get('/api/ping', (req, res) => {
  console.log('✅ Ping received!');
  res.json({ success: true, message: 'Backend is alive!', time: new Date() });
});

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    console.log('🔍 Querying products table...');
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    console.log(`✅ Found ${rows.length} products`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.log('❌ DB Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create product
app.post('/api/products', async (req, res) => {
  const { name, category, price, stock } = req.body;
  console.log('➕ Creating product:', { name, category, price, stock });
  try {
    const [result] = await db.query(
      'INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)',
      [name, category, price, stock]
    );
    console.log('✅ Product created with id:', result.insertId);
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.log('❌ DB Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  console.log('🗑️ Deleting product id:', req.params.id);
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    console.log('✅ Product deleted');
    res.json({ success: true });
  } catch (err) {
    console.log('❌ DB Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✅ Backend running at http://0.0.0.0:${PORT}`);
  console.log(`✅ Test ping at: http://192.168.31.33:${PORT}/api/ping`);
  console.log(`✅ Products at: http://192.168.31.33:${PORT}/api/products\n`);
});