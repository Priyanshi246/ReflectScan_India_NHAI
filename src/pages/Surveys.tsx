import { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertCircle, ChevronDown, User, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Survey } from '../types';

const statusConfig = {
  completed: { label: 'Completed', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', dot: 'bg-emerald-400', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', dot: 'bg-cyan-400 animate-pulse', icon: Clock },
  pending_review: { label: 'Pending Review', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400', icon: AlertCircle },
};

export default function Surveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchSurveys();
  }, []);

  async function fetchSurveys() {
    setLoading(true);
    const { data } = await supabase
      .from('surveys')
      .select('*, roads(name, highway_code, zone)')
      .order('created_at', { ascending: false });
    if (data) setSurveys(data as Survey[]);
    setLoading(false);
  }

  const filtered = filter === 'all' ? surveys : surveys.filter(s => s.status === filter);

  const totals = {
    all: surveys.length,
    completed: surveys.filter(s => s.status === 'completed').length,
    in_progress: surveys.filter(s => s.status === 'in_progress').length,
    pending_review: surveys.filter(s => s.status === 'pending_review').length,
  };

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function calcDuration(start: string, end: string | null) {
    if (!end) return 'Ongoing';
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / 3600000;
    return `${diff.toFixed(1)}h`;
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
      <div className="grid grid-cols-4 gap-4">
        {(['all', 'completed', 'in_progress', 'pending_review'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`p-4 rounded-xl border text-left transition-all ${
              filter === key
                ? 'bg-cyan-500/10 border-cyan-500/30'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <p className={`text-2xl font-bold ${filter === key ? 'text-cyan-400' : 'text-white'}`}>
              {totals[key as keyof typeof totals]}
            </p>
            <p className="text-slate-400 text-xs mt-1 capitalize">{key.replace('_', ' ')}</p>
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">Survey Records</h3>
          <span className="text-slate-500 text-xs">{filtered.length} records</span>
        </div>
        <div className="divide-y divide-slate-800">
          {filtered.map((survey) => {
            const cfg = statusConfig[survey.status];
            const StatusIcon = cfg.icon;
            const isOpen = expanded === survey.id;
            const passRate = survey.total_assets > 0
              ? Math.round((survey.pass_count / survey.total_assets) * 100)
              : 0;

            return (
              <div key={survey.id}>
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors text-left"
                  onClick={() => setExpanded(isOpen ? null : survey.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-slate-200 font-medium text-sm">{survey.route_name}</p>
                      {survey.roads && (
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          {survey.roads.highway_code}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-slate-500 text-xs">
                        <User className="w-3 h-3" /> {survey.inspector_name}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 text-xs">
                        <MapPin className="w-3 h-3" /> {survey.inspector_zone}
                      </span>
                      <span className="text-slate-500 text-xs">{formatDate(survey.start_time)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-white text-sm font-semibold">{survey.total_assets} assets</p>
                      <p className="text-slate-500 text-xs">{calcDuration(survey.start_time, survey.end_time)}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 bg-slate-800/20">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Total Assets</p>
                        <p className="text-white font-bold text-lg">{survey.total_assets}</p>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Passed</p>
                        <p className="text-emerald-400 font-bold text-lg">{survey.pass_count}</p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Failed</p>
                        <p className="text-red-400 font-bold text-lg">{survey.fail_count}</p>
                      </div>
                      <div className="bg-slate-800 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Pass Rate</p>
                        <p className={`font-bold text-lg ${passRate >= 75 ? 'text-emerald-400' : passRate >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                          {passRate}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                          style={{ width: `${passRate}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-slate-500 text-xs">0%</span>
                        <span className="text-slate-500 text-xs">Pass Threshold: 75%</span>
                        <span className="text-slate-500 text-xs">100%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
