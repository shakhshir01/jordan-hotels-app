import { useEffect, useState, useRef } from "react";

/**
 * Simple fetch hook for async functions (fn should be an async function that returns data)
 * usage: const { data, loading, error, reload } = useFetch(() => hotelAPI.getDeals());
 */
export default function useFetch(fn, deps = []) {
  const mounted = useRef(true);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(fn));
  const [error, setError] = useState(null);

  const run = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn(...args);
      if (mounted.current) setData(result);
      return result;
    } catch (err) {
      if (mounted.current) setError(err);
      throw err;
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    mounted.current = true;
    if (fn) run();
    return () => { mounted.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, run };
}
