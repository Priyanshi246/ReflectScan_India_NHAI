import { useEffect, useState } from 'react';
import { FileBarChart2, Download, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Survey, Road } from '../types';

interface RoadStats {
  road: Road;
  surveys: number;
  totalAssets: number;
  passCount: number;
  failCount: number;
  passRate: number;
}

const monthlyTrend = [
  { month: 'Nov', total: 180, pass: 142, fail: 38 },
  { month: 'Dec', total: 195, pass: 158, fail: 37 },
  { month: 'Jan', total: 210, pass: 165, fail: 45 },
  { month: 'Feb', total: 228, pass: 182, fail: 46 },
  { month: 'Mar', total: 241, pass: 197, fail: 44 },
  { month: 'Apr', total: 256, pass: 214, fail: 42 },
];

export default function Reports() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [roads, setRoads] = useState<Road[]>([]);
  const [roadStats, setRoadStats] = useState<RoadStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('Apr 2025');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [surveysRes, roadsRes] = await Promise.all([
      supabase.from('surveys').select('*').eq('status', 'completed'),
      supabase.from('roads').select('*'),
    ]);

    if (surveysRes.data && roadsRes.data) {
      setSurveys(surveysRes.data as Survey[]);
      setRoads(roadsRes.data as Road[]);

      const stats: RoadStats[] = roadsRes.data.map((road) => {
        const roadSurveys = surveysRes.data!.filter(s => s.road_id === road.id);
        const totalAssets = roadSurveys.reduce((sum, s) => sum + s.total_assets, 0);
        const passCount = roadSurveys.reduce((sum, s) => sum + s.pass_count, 0);
        const failCount = roadSurveys.reduce((sum, s) => sum + s.fail_count, 0);
        const passRate = totalAssets > 0 ? Math.round((passCount / totalAssets) * 100) : 0;
        return { road, surveys: roadSurveys.length, totalAssets, passCount, failCount, passRate };
      });
      setRoadStats(stats.sort((a, b) => b.surveys - a.surveys));
    }
    setLoading(false);
  }

  const totalAssets = surveys.reduce((sum, s) => sum + s.total_assets, 0);
  const totalPass = surveys.reduce((sum, s) => sum + s.pass_count, 0);
  const totalFail = surveys.reduce((sum, s) => sum + s.fail_count, 0);
  const overallPassRate = totalAssets > 0 ? Math.round((totalPass / totalAssets) * 100) : 0;

  const maxVal = Math.max(...monthlyTrend.map(m => m.total));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-300 text-sm focus:outline-none"
            >
              {['Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm font-medium rounded-lg hover:bg-cyan-500/25 transition-colors">
          <Download className="w-4 h-4" />
          Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total Inspections</p>
          <p className="text-white text-2xl font-bold">{totalAssets}</p>
          <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs">
            <TrendingUp className="w-3 h-3" /> +12% vs last month
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Overall Pass Rate</p>
          <p className={`text-2xl font-bold ${overallPassRate >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>{overallPassRate}%</p>
          <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs">
            <TrendingUp className="w-3 h-3" /> +3% improvement
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Assets Passed</p>
          <p className="text-emerald-400 text-2xl font-bold">{totalPass}</p>
          <p className="text-slate-500 text-xs mt-1">Compliant assets</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Assets Failed</p>
          <p className="text-red-400 text-2xl font-bold">{totalFail}</p>
          <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs">
            <TrendingDown className="w-3 h-3" /> -5% vs last month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Inspection Trend</h3>
            <span className="text-slate-500 text-xs">6 Month History</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {monthlyTrend.map((m) => {
              const totalH = (m.total / maxVal) * 100;
              const passH = (m.pass / maxVal) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative flex items-end justify-center" style={{ height: '120px' }}>
                    <div className="absolute bottom-0 w-full bg-red-500/30 rounded-t-sm" style={{ height: `${totalH}%` }} />
                    <div className="absolute bottom-0 w-full bg-emerald-500/70 rounded-t-sm" style={{ height: `${passH}%` }} />
                  </div>
                  <span className="text-slate-500 text-xs">{m.month}</span>
                  <span className="text-slate-400 text-xs font-medium">{m.total}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm bg-emerald-500/70" />
              <span className="text-slate-400 text-xs">Pass</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded-sm bg-red-500/30" />
              <span className="text-slate-400 text-xs">Fail</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Highway Breakdown</h3>
            <FileBarChart2 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="space-y-3">
            {roadStats.filter(rs => rs.surveys > 0).map((rs) => (
              <div key={rs.road.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">{rs.road.highway_code}</span>
                    <span className="text-slate-300 text-sm">{rs.road.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-xs">{rs.totalAssets} assets</span>
                    <span className={`text-sm font-bold ${rs.passRate >= 75 ? 'text-emerald-400' : rs.passRate >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {rs.passRate}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${rs.passRate >= 75 ? 'bg-emerald-500' : rs.passRate >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${rs.passRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="text-white font-semibold">Completed Survey Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Route', 'Inspector', 'Zone', 'Assets', 'Pass', 'Fail', 'Pass Rate', 'Duration'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-medium uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {surveys.map((s) => {
                const rate = s.total_assets > 0 ? Math.round((s.pass_count / s.total_assets) * 100) : 0;
                const dur = s.end_time
                  ? `${((new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 3600000).toFixed(1)}h`
                  : '-';
                return (
                  <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-300 text-sm">{s.route_name}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{s.inspector_name}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{s.inspector_zone}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm font-medium">{s.total_assets}</td>
                    <td className="px-4 py-3 text-emerald-400 text-sm font-medium">{s.pass_count}</td>
                    <td className="px-4 py-3 text-red-400 text-sm font-medium">{s.fail_count}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${rate >= 75 ? 'text-emerald-400' : rate >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{rate}%</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-sm">{dur}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
