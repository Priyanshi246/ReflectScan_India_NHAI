import { Bell, RefreshCw, Search } from 'lucide-react';
import { Page } from '../types';

interface HeaderProps {
  currentPage: Page;
  alertCount: number;
  onNavigate: (page: Page) => void;
  onRefresh: () => void;
}

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of highway retroreflectivity across India' },
  surveys: { title: 'Surveys', subtitle: 'Field inspection sessions and progress tracking' },
  assets: { title: 'Assets', subtitle: 'Road signs, lane markings, studs and delineators' },
  map: { title: 'Map View', subtitle: 'Geographic distribution of assets and red zones' },
  alerts: { title: 'Alerts', subtitle: 'Active safety alerts and maintenance notifications' },
  reports: { title: 'Reports', subtitle: 'Monthly performance reports and analytics' },
};

export default function Header({ currentPage, alertCount, onNavigate, onRefresh }: HeaderProps) {
  const { title, subtitle } = pageTitles[currentPage];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-slate-950/95 backdrop-blur border-b border-slate-800 flex items-center justify-between px-6 z-20">
      <div>
        <h2 className="text-white font-semibold text-base leading-tight">{title}</h2>
        <p className="text-slate-500 text-xs">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search assets, highways..."
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg pl-9 pr-4 py-1.5 w-56 focus:outline-none focus:border-cyan-500/50 placeholder-slate-500"
          />
        </div>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Refresh data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={() => onNavigate('alerts')}
          className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {alertCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-xs font-bold">
          NO
        </div>
      </div>
    </header>
  );
}
