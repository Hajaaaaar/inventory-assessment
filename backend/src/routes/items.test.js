const request = require('supertest');
const express = require('express');

// Mock fs before importing the router
// We define the mock manually to ensure require('fs').promises works
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const itemsRouter = require('./items');
const fs = require('fs').promises; 

// Setup a Mock Express App
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

describe('GET /api/items', () => {
  const mockData = [
    { id: 1, name: 'Test Item A', price: 100 },
    { id: 2, name: 'Test Item B', price: 200 },
    { id: 3, name: 'Cheap Item', price: 50 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated items', async () => {
    // Correctly mock the resolved value
    fs.readFile.mockResolvedValue(JSON.stringify(mockData));

    const res = await request(app).get('/api/items?page=1&limit=2');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(3);
  });

  it('should filter items by search query (q)', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify(mockData));

    const res = await request(app).get('/api/items?q=Cheap');

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Cheap Item');
  });

  it('should handle file read errors good', async () => {
    fs.readFile.mockRejectedValue(new Error('Disk Error'));

    const res = await request(app).get('/api/items');

    // Expecting error status 
    expect(res.statusCode).not.toBe(200);
  });
});

describe('POST /api/items', () => {
  it('should create a new item', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify([])); 
    fs.writeFile.mockResolvedValue(undefined); 

    const newItem = { name: 'New Thing', price: 999 };
    
    const res = await request(app)
      .post('/api/items')
      .send(newItem);

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('New Thing');
    expect(fs.writeFile).toHaveBeenCalled(); 
  });

  it('should fail if name is missing', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ price: 500 }); 

    expect(res.statusCode).toBe(400); 
  });
});

describe('GET /api/items/:id', () => {
  it('should return a single item by ID', async () => {
    // Mock data with a specific ID
    fs.readFile.mockResolvedValue(JSON.stringify([
      { id: 1, name: 'Target Item', price: 100 }
    ]));

    const res = await request(app).get('/api/items/1');

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Target Item');
  });

  it('should return 404 if item not found', async () => {
    fs.readFile.mockResolvedValue(JSON.stringify([
      { id: 1, name: 'Existing Item' }
    ]));

    // Request ID 999 which doesn't exist in our mock
    const res = await request(app).get('/api/items/999');

    expect(res.statusCode).toBe(404);
  });
});