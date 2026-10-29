import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchRestaurants } from './api.js';
import { useAuth } from './auth.jsx';

const RestaurantsContext = createContext(null);

export function RestaurantsProvider({ children }) {
  const { session } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!session?.token) return;

    setLoading(true);
    setError('');

    try {
      const data = await fetchRestaurants(session.token);
      setItems(Array.isArray(data?.results) ? data.results : []);
    } catch (requestError) {
      setError(requestError.message || 'Could not load restaurants');
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(
    () => ({ items, loading, error, refresh: load }),
    [items, loading, error, load],
  );

  return <RestaurantsContext.Provider value={value}>{children}</RestaurantsContext.Provider>;
}

export function useRestaurants() {
  const context = useContext(RestaurantsContext);

  if (!context) {
    throw new Error('useRestaurants must be used inside RestaurantsProvider');
  }

  return context;
}
