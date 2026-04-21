import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Surveys from './pages/Surveys';
import Assets from './pages/Assets';
import MapView from './pages/MapView';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import { Page } from './types';
import { supabase } from './lib/supabase';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [alertCount, setAlertCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAlertCount();
  }, [refreshKey]);

  async function fetchAlertCount() {
    const { count } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);
    setAlertCount(count || 0);
  }

  function handleRefresh() {
    setRefreshKey(k => k + 1);
  }

  const pageComponents: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard key={refreshKey} />,
    surveys: <Surveys key={refreshKey} />,
    assets: <Assets key={refreshKey} />,
    map: <MapView key={refreshKey} />,
    alerts: <Alerts key={refreshKey} />,
    reports: <Reports key={refreshKey} />,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} alertCount={alertCount} />
      <Header
        currentPage={currentPage}
        alertCount={alertCount}
        onNavigate={setCurrentPage}
        onRefresh={handleRefresh}
      />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="p-6">
          {pageComponents[currentPage]}
        </div>
      </main>
    </div>
  );
}
