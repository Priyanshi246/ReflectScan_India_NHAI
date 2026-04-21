import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Surveys from './pages/Surveys';
import Assets from './pages/Assets';
import MapView from './pages/MapView';
import Alerts from './pages/Alerts';
import Reports from './pages/Reports';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { Page } from './types';
import { supabase } from './lib/supabase';

type AuthState = 'loading' | 'authenticated' | 'login' | 'signup';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [alertCount, setAlertCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (authState === 'authenticated') {
      fetchAlertCount();
    }
  }, [refreshKey, authState]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    setAuthState(session ? 'authenticated' : 'login');
  }

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

  async function handleLogout() {
    await supabase.auth.signOut();
    setAuthState('login');
  }

  const pageComponents: Record<Page, React.ReactNode> = {
    dashboard: <Dashboard key={refreshKey} />,
    surveys: <Surveys key={refreshKey} />,
    assets: <Assets key={refreshKey} />,
    map: <MapView key={refreshKey} />,
    alerts: <Alerts key={refreshKey} />,
    reports: <Reports key={refreshKey} />,
  };

  if (authState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === 'login') {
    return (
      <Login
        onLoginSuccess={() => setAuthState('authenticated')}
        onSignUpClick={() => setAuthState('signup')}
      />
    );
  }

  if (authState === 'signup') {
    return (
      <SignUp
        onSignUpSuccess={() => setAuthState('authenticated')}
        onBackClick={() => setAuthState('login')}
      />
    );
  }

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
