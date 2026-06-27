import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { FindingsFeed } from "@/pages/FindingsFeed";
import { FindingDetail } from "@/pages/FindingDetail";
import { Monitoring } from "@/pages/Monitoring";
import { Investigations } from "@/pages/Investigations";
import { Settings } from "@/pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<FindingsFeed />} />
          <Route path="findings/:id" element={<FindingDetail />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="investigations" element={<Investigations />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
