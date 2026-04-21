import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Map,
  Bell,
  FileBarChart2,
  ChevronRight,
  Shield,
  LogOut,
} from 'lucide-react';
import { Page } from '../types';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  alertCount: number;
}

const navItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'surveys', label: 'Surveys', icon: ClipboardList },
  { id: 'assets', label: 'Assets', icon: MapPin },
  { id: 'map', label: 'Map View', icon: Map },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'reports', label: 'Reports', icon: FileBarChart2 },
];

export default function Sidebar({ currentPage, onNavigate, alertCount }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-30">
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">ReflectScan</h1>
            <p className="text-cyan-400 text-xs font-medium">India · NHAI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = currentPage === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {label}
              </div>
              <div className="flex items-center gap-1.5">
                {id === 'alerts' && alertCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-500" />}
              </div>
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800 space-y-2">
        <div className="px-3 py-2.5 rounded-lg bg-slate-800/60">
          <p className="text-white text-sm font-medium">NHAI Officer</p>
          <p className="text-slate-400 text-xs">admin@nhai.gov.in</p>
        </div>
        <button onClick={async () => {
          await supabase.auth.signOut();
          window.location.reload();
        }} className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-red-400 text-sm rounded-lg hover:bg-red-500/10 transition-colors">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
