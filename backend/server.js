const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Increase limit for base64 photo uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Log every request
app.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/ping', (req, res) => {
  console.log('✅ Ping received!');
  res.json({ success: true, message: 'Backend is alive!', time: new Date() });
});

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
    console.log(`✅ Found ${rows.length} products`);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.log('❌ DB Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create product (with photo + location)
app.post('/api/products', async (req, res) => {
  const { name, category, price, stock, photo, latitude, longitude, location_name } = req.body;
  console.log('➕ Creating product:', { name, category, price, stock, latitude, longitude, location_name });
  console.log('📸 Photo included:', photo ? 'YES' : 'NO');
  try {
    const [result] = await db.query(
      `INSERT INTO products 
        (name, category, price, stock, photo, latitude, longitude, location_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category, price, stock, photo || null, latitude || null, longitude || null, location_name || null]
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
});