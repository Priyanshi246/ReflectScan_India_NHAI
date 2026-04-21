import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Alert, AlertSeverity } from '../types';

const severityConfig: Record<AlertSeverity, { label: string; color: string; bg: string; border: string; dot: string; ring: string }> = {
  critical: {
    label: 'Critical',
    color: 'text-red-400',
    bg: 'bg-red-500/8',
    border: 'border-red-500/30',
    dot: 'bg-red-500 animate-pulse',
    ring: 'ring-red-500/20',
  },
  high: {
    label: 'High',
    color: 'text-orange-400',
    bg: 'bg-orange-500/8',
    border: 'border-orange-500/25',
    dot: 'bg-orange-500',
    ring: 'ring-orange-500/20',
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-400',
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/25',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/20',
  },
  low: {
    label: 'Low',
    color: 'text-slate-400',
    bg: 'bg-slate-800/50',
    border: 'border-slate-700',
    dot: 'bg-slate-500',
    ring: 'ring-slate-500/20',
  },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'resolved' | 'all'>('active');
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    setLoading(true);
    const { data } = await supabase
      .from('alerts')
      .select('*, roads(name, highway_code), assets(type, location_description)')
      .order('created_at', { ascending: false });
    if (data) setAlerts(data as Alert[]);
    setLoading(false);
  }

  async function resolveAlert(id: string) {
    setResolving(id);
    await supabase
      .from('alerts')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id);
    await fetchAlerts();
    setResolving(null);
  }

  const filtered = alerts.filter(a => {
    if (filter === 'active') return !a.resolved;
    if (filter === 'resolved') return a.resolved;
    return true;
  });

  const counts = {
    active: alerts.filter(a => !a.resolved).length,
    resolved: alerts.filter(a => a.resolved).length,
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical' && !a.resolved).length,
    high: alerts.filter(a => a.severity === 'high' && !a.resolved).length,
  };

  function timeAgo(iso: string) {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-400 text-2xl font-bold">{counts.critical}</p>
          <p className="text-slate-400 text-xs mt-1">Critical Alerts</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
          <p className="text-orange-400 text-2xl font-bold">{counts.high}</p>
          <p className="text-slate-400 text-xs mt-1">High Priority</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-white text-2xl font-bold">{counts.active}</p>
          <p className="text-slate-400 text-xs mt-1">Active Total</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-emerald-400 text-2xl font-bold">{counts.resolved}</p>
          <p className="text-slate-400 text-xs mt-1">Resolved</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <h3 className="text-white font-semibold">Alert Feed</h3>
          </div>
          <div className="flex gap-1">
            {(['active', 'resolved', 'all'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === key
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)} ({counts[key]})
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-600">
            <CheckCircle2 className="w-10 h-10 mb-3" />
            <p className="text-base font-medium text-slate-500">All clear</p>
            <p className="text-sm mt-1">No {filter} alerts at this time</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {filtered.map((alert) => {
              const cfg = severityConfig[alert.severity];
              return (
                <div key={alert.id} className={`px-5 py-4 ${alert.resolved ? 'opacity-60' : ''} hover:bg-slate-800/20 transition-colors`}>
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wide ${cfg.color}`}>{cfg.label}</span>
                            {alert.roads && (
                              <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                                {alert.roads.highway_code}
                              </span>
                            )}
                            {alert.resolved && (
                              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Resolved</span>
                            )}
                          </div>
                          <h4 className="text-slate-200 font-medium text-sm mb-1">{alert.title}</h4>
                          <p className="text-slate-400 text-xs leading-relaxed">{alert.message}</p>
                          {alert.assets && (
                            <p className="text-slate-500 text-xs mt-1.5 capitalize">
                              Asset: {alert.assets.type?.replace('_', ' ')} · {alert.assets.location_description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 text-slate-500 text-xs">
                            <Clock className="w-3 h-3" />
                            {timeAgo(alert.created_at)}
                          </div>
                          {!alert.resolved && (
                            <button
                              onClick={() => resolveAlert(alert.id)}
                              disabled={resolving === alert.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/25 transition-colors disabled:opacity-50"
                            >
                              {resolving === alert.id ? (
                                <div className="w-3 h-3 border border-emerald-400/50 border-t-emerald-400 rounded-full animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <div className={`mt-3 ml-6 h-0.5 rounded-full ${cfg.border.replace('border', 'bg').replace('border-', 'bg-')} opacity-30`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
