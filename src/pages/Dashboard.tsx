import { useEffect, useState } from 'react';
import {
  MapPin, ClipboardList, AlertTriangle, CheckCircle2,
  Route, XCircle, Activity, Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Survey, Alert, Inspection } from '../types';
import StatCard from '../components/StatCard';
import ScoreBadge from '../components/ScoreBadge';

interface DashboardStats {
  totalAssets: number;
  passRate: number;
  activeAlerts: number;
  surveysThisMonth: number;
  failCount: number;
  warningCount: number;
}

const highwayPerformance = [
  { code: 'NH-48', name: 'Delhi-Mumbai', score: 78, length: '1350 km' },
  { code: 'NH-44', name: 'Golden Quadrilateral N', score: 63, length: '920 km' },
  { code: 'NH-16', name: 'Chennai-Kolkata', score: 81, length: '1711 km' },
  { code: 'NH-66', name: 'Mumbai-Pune', score: 85, length: '94 km' },
  { code: 'NH-44S', name: 'Bengaluru-Hyderabad', score: 61, length: '570 km' },
  { code: 'NH-19', name: 'Kolkata-Varanasi', score: 82, length: '679 km' },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalAssets: 0, passRate: 0, activeAlerts: 0, surveysThisMonth: 0, failCount: 0, warningCount: 0 });
  const [recentSurveys, setRecentSurveys] = useState<Survey[]>([]);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [assetsRes, alertsRes, surveysRes, inspectionsRes] = await Promise.all([
      supabase.from('assets').select('current_status'),
      supabase.from('alerts').select('*, roads(name, highway_code)').eq('resolved', false).order('created_at', { ascending: false }).limit(3),
      supabase.from('surveys').select('*, roads(name, highway_code)').order('created_at', { ascending: false }).limit(5),
      supabase.from('inspections').select('*, assets(type, location_description)').order('created_at', { ascending: false }).limit(6),
    ]);

    if (assetsRes.data) {
      const total = assetsRes.data.length;
      const pass = assetsRes.data.filter(a => a.current_status === 'pass').length;
      const fail = assetsRes.data.filter(a => a.current_status === 'fail').length;
      const warning = assetsRes.data.filter(a => a.current_status === 'warning').length;
      setStats({
        totalAssets: total,
        passRate: total > 0 ? Math.round((pass / total) * 100) : 0,
        activeAlerts: alertsRes.data?.length || 0,
        surveysThisMonth: surveysRes.data?.length || 0,
        failCount: fail,
        warningCount: warning,
      });
    }

    if (alertsRes.data) setCriticalAlerts(alertsRes.data as Alert[]);
    if (surveysRes.data) setRecentSurveys(surveysRes.data as Survey[]);
    if (inspectionsRes.data) setRecentInspections(inspectionsRes.data as Inspection[]);
    setLoading(false);
  }

  const statusColors = { in_progress: 'text-cyan-400 bg-cyan-500/10', completed: 'text-emerald-400 bg-emerald-500/10', pending_review: 'text-amber-400 bg-amber-500/10' };
  const statusLabels = { in_progress: 'In Progress', completed: 'Completed', pending_review: 'Pending Review' };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Assets" value={stats.totalAssets} subtitle="Across all highways" icon={MapPin} accent="cyan" trend={{ value: 8, label: 'vs last month' }} />
        <StatCard title="Pass Rate" value={`${stats.passRate}%`} subtitle="Assets in compliance" icon={CheckCircle2} accent="emerald" trend={{ value: 3, label: 'improvement' }} />
        <StatCard title="Active Alerts" value={stats.activeAlerts} subtitle="Require attention" icon={AlertTriangle} accent="red" trend={{ value: -2, label: 'vs last week' }} />
        <StatCard title="Surveys Run" value={stats.surveysThisMonth} subtitle="This period" icon={ClipboardList} accent="cyan" />
        <StatCard title="Failed Assets" value={stats.failCount} subtitle="Below 60% threshold" icon={XCircle} accent="red" />
        <StatCard title="Warnings" value={stats.warningCount} subtitle="60-74% range" icon={Activity} accent="amber" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold">Highway Performance</h3>
              <p className="text-slate-500 text-xs mt-0.5">Average reflectivity score by corridor</p>
            </div>
            <span className="text-xs text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">Live</span>
          </div>
          <div className="space-y-4">
            {highwayPerformance.map((hw) => {
              const color = hw.score >= 75 ? 'bg-emerald-500' : hw.score >= 60 ? 'bg-amber-500' : 'bg-red-500';
              const textColor = hw.score >= 75 ? 'text-emerald-400' : hw.score >= 60 ? 'text-amber-400' : 'text-red-400';
              return (
                <div key={hw.code}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{hw.code}</span>
                      <span className="text-slate-300 text-sm">{hw.name}</span>
                      <span className="text-slate-600 text-xs">{hw.length}</span>
                    </div>
                    <span className={`text-sm font-bold ${textColor}`}>{hw.score}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${hw.score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Active Alerts</h3>
            <span className="text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full font-medium">
              {criticalAlerts.length} open
            </span>
          </div>
          {criticalAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-600">
              <CheckCircle2 className="w-8 h-8 mb-2" />
              <p className="text-sm">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {criticalAlerts.map((alert) => {
                const severityColors = { critical: 'border-red-500/40 bg-red-500/5', high: 'border-orange-500/40 bg-orange-500/5', medium: 'border-amber-500/40 bg-amber-500/5', low: 'border-slate-600 bg-slate-800/50' };
                const dotColors = { critical: 'bg-red-500 animate-pulse', high: 'bg-orange-500', medium: 'bg-amber-500', low: 'bg-slate-500' };
                return (
                  <div key={alert.id} className={`rounded-lg border p-3 ${severityColors[alert.severity]}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${dotColors[alert.severity]}`} />
                      <div>
                        <p className="text-slate-200 text-xs font-medium leading-snug">{alert.title}</p>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Surveys</h3>
            <Route className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-3">
            {recentSurveys.map((survey) => (
              <div key={survey.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-200 text-sm font-medium truncate">{survey.route_name}</p>
                    <p className="text-slate-500 text-xs">{survey.inspector_name} · {survey.inspector_zone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-slate-400 text-xs">{survey.pass_count + survey.fail_count}/{survey.total_assets}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[survey.status]}`}>
                    {statusLabels[survey.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Inspections</h3>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-3">
            {recentInspections.map((insp) => {
              const typeIcons: Record<string, string> = { road_sign: '🚧', lane_marking: '〰️', road_stud: '⚫', delineator: '📍' };
              return (
                <div key={insp.id} className="flex items-center justify-between p-3 bg-slate-800/60 rounded-lg hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg w-8 flex-shrink-0">{typeIcons[insp.assets?.type || 'road_sign']}</span>
                    <div className="min-w-0">
                      <p className="text-slate-200 text-sm font-medium truncate capitalize">
                        {(insp.assets?.type || '').replace('_', ' ')}
                      </p>
                      <p className="text-slate-500 text-xs truncate">{insp.assets?.location_description}</p>
                    </div>
                  </div>
                  <ScoreBadge score={insp.score} status={insp.status} size="sm" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
