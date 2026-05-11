import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { TriggersPage } from './pages/TriggersPage';
import { TriggerFormPage } from './pages/TriggerFormPage';
import { QueuePage } from './pages/QueuePage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/triggers" element={<TriggersPage />} />
              <Route path="/triggers/new" element={<TriggerFormPage />} />
              <Route path="/triggers/:id" element={<TriggerFormPage />} />
              <Route path="/queue" element={<QueuePage />} />
              <Route path="/audit" element={<AuditPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </BrowserRouter>
  );
}
