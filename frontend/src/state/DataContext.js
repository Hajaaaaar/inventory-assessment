import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState({ items: [], meta: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async ({ page = 1, limit = 20, q = '', signal } = {}) => {
    setLoading(true);
    setError(null);
    try {
      // Build Query String
      const params = new URLSearchParams({ page, limit, q });
      
      const res = await fetch(`http://localhost:5000/api/items?${params}`, { signal });
      
      if (!res.ok) throw new Error('Failed to fetch items');

      const json = await res.json();
      
      // Update state with new structure { data: [...], meta: {...} }
      setData({ items: json.data, meta: json.meta });
    } catch (err) {
      // Ignore errors caused by cancelling the fetch 
      if (err.name !== 'AbortError') {
        console.error(err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DataContext.Provider value={{ ...data, fetchItems, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);