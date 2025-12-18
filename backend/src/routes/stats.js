const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

// Store the calculated stats to not redo  math 
let cachedStats = null;
let lastModified = 0;

router.get('/', async (req, res, next) => {
  try {
    // Check if file changed since last cached
    const fileStats = await fs.stat(DATA_PATH);
    const currentMtime = fileStats.mtimeMs;

    if (cachedStats && currentMtime === lastModified) {
      // console.log('Serving stats from cache'); 
      return res.json(cachedStats);
    }

    // If empty or  changed re-calculate
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const items = JSON.parse(raw);

    const total = items.length;
    // average price 
    const averagePrice = total > 0 
      ? items.reduce((acc, cur) => acc + cur.price, 0) / total 
      : 0;

    // Update the cache
    cachedStats = { total, averagePrice };
    lastModified = currentMtime;

    res.json(cachedStats);

  } catch (err) {
    next(err);
  }
});

module.exports = router;