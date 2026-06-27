import { useEffect, useState } from "react";
import type { Result } from "./api";
import { useApp } from "./appState";

/** Fetch a Result<T>, track loading, and report the data source up to app state.
 *  Re-runs whenever the global refreshKey bumps (e.g. after "Run investigation"). */
export function useResource<T>(fn: () => Promise<Result<T>>): {
  data: T | null;
  loading: boolean;
} {
  const { setSource, refreshKey } = useApp();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fn().then((res) => {
      if (!alive) return;
      setData(res.data);
      setSource(res.source);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return { data, loading };
}
