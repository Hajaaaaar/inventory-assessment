const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Helper to Read data asynchronously
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    // Handle "page" and "limit" from query params
    let { page = 1, limit = 20, q = '' } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    let results = data;

    if (q) {
      // Simple substring search (sub‑optimal)
      results = results.filter(item => item.name.toLowerCase().includes(q.toLowerCase()));
    }

    // Calculate pagination
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = results.slice(startIndex, endIndex);

    // Return object with "meta" data (needed for Frontend!)
    res.json({
      data: paginatedResults,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const newItem = req.body;
    // Simple Validation
    if (!newItem.name || !newItem.price) {
      const err = new Error('Name and Price are required');
      err.status = 400;
      throw err;
    }

    const data = await readData();
    newItem.id = Date.now();
    data.push(newItem);

    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
});

module.exports = router;