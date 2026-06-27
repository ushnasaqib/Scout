import { createContext, useContext, useState, type ReactNode } from "react";
import type { Source } from "./api";

interface AppState {
  source: Source;
  setSource: (s: Source) => void;
  refreshKey: number;
  bumpRefresh: () => void;
}

const Ctx = createContext<AppState>({
  source: "mock",
  setSource: () => {},
  refreshKey: 0,
  bumpRefresh: () => {},
});

export const useApp = () => useContext(Ctx);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<Source>("mock");
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <Ctx.Provider
      value={{ source, setSource, refreshKey, bumpRefresh: () => setRefreshKey((k) => k + 1) }}
    >
      {children}
    </Ctx.Provider>
  );
}
