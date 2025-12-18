import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/App';

// Mocking react-window (JSDOM struggles)
jest.mock('react-window', () => ({
  FixedSizeList: ({ children, itemCount, itemData }) => (
    <div data-testid="virtual-list">
      {Array.from({ length: itemCount }).map((_, index) => (
        // wrapper needs a key to stop react warning noise
        <div key={index}>
          {children({ 
            index, 
            style: {}, 
            data: itemData 
          })}
        </div>
      ))}
    </div>
  ),
  FixedSizeGrid: ({ children, rowCount, columnCount, itemData }) => (
    <div data-testid="virtual-grid">
      {Array.from({ length: rowCount * columnCount }).map((_, index) => {
        const rowIndex = Math.floor(index / columnCount);
        const columnIndex = index % columnCount;
        return (
          <div key={index}>
            {children({ 
              rowIndex, 
              columnIndex, 
              style: {}, 
              data: itemData 
            })}
          </div>
        );
      })}
    </div>
  ),
}));

// Reset mocks before every test
beforeEach(() => {
  jest.clearAllMocks();

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: [
          { id: 1, name: 'Test Laptop', price: 999, category: 'Tech' },
          { id: 2, name: 'Test Chair', price: 50, category: 'Furniture' }
        ],
        meta: { page: 1, totalPages: 5, total: 100 }
      }),
    })
  );
});


test('renders the inventory page and fetches data', async () => {
  render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  );

  // Check if Header renders
  expect(screen.getByRole('heading', { name: /Inventory/i })).toBeInTheDocument();

  // wait for async data to populate
  await waitFor(() => {
    expect(screen.getByText('Test Laptop')).toBeInTheDocument();
  });
  
  // check if pricing and pagination came through
  expect(screen.getByText('$999')).toBeInTheDocument();
  expect(screen.getByText(/Page 1 of 5/i)).toBeInTheDocument();
});