import { useEffect, useState } from 'react';
import { MapPin, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Asset, AssetType, AssetStatus } from '../types';
import ScoreBadge from '../components/ScoreBadge';

const typeConfig: Record<AssetType, { label: string; icon: string; color: string }> = {
  road_sign: { label: 'Road Sign', icon: '🚧', color: 'text-blue-400 bg-blue-500/10' },
  lane_marking: { label: 'Lane Marking', icon: '〰️', color: 'text-slate-300 bg-slate-500/10' },
  road_stud: { label: 'Road Stud', icon: '⚫', color: 'text-yellow-400 bg-yellow-500/10' },
  delineator: { label: 'Delineator', icon: '📍', color: 'text-orange-400 bg-orange-500/10' },
};

const typeCounts = (assets: Asset[]) => ({
  all: assets.length,
  road_sign: assets.filter(a => a.type === 'road_sign').length,
  lane_marking: assets.filter(a => a.type === 'lane_marking').length,
  road_stud: assets.filter(a => a.type === 'road_stud').length,
  delineator: assets.filter(a => a.type === 'delineator').length,
});

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score_asc' | 'score_desc' | 'recent'>('score_asc');

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    setLoading(true);
    const { data } = await supabase
      .from('assets')
      .select('*, roads(name, highway_code)')
      .order('current_score', { ascending: true });
    if (data) setAssets(data as Asset[]);
    setLoading(false);
  }

  const counts = typeCounts(assets);

  let filtered = assets;
  if (typeFilter !== 'all') filtered = filtered.filter(a => a.type === typeFilter);
  if (statusFilter !== 'all') filtered = filtered.filter(a => a.current_status === statusFilter);

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'score_asc') return a.current_score - b.current_score;
    if (sortBy === 'score_desc') return b.current_score - a.current_score;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  function formatDate(iso: string | null) {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  const scoreBarColor = (score: number) =>
    score >= 75 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'road_sign', 'lane_marking', 'road_stud', 'delineator'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                typeFilter === key
                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {key !== 'all' && <span>{typeConfig[key as AssetType].icon}</span>}
              <span className="capitalize">{key === 'all' ? `All (${counts.all})` : `${typeConfig[key as AssetType].label} (${counts[key as AssetType]})`}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">All Status</option>
              <option value="pass">Pass</option>
              <option value="warning">Warning</option>
              <option value="fail">Fail</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="score_asc">Score: Low to High</option>
              <option value="score_desc">Score: High to Low</option>
              <option value="recent">Most Recent</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 text-sm rounded-lg hover:text-slate-200 hover:border-slate-600 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800">
          <div className="grid grid-cols-12 gap-4 text-xs text-slate-500 font-medium uppercase tracking-wider">
            <div className="col-span-1">Type</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2">Highway</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Score</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Inspected</div>
          </div>
        </div>
        <div className="divide-y divide-slate-800/50">
          {filtered.map((asset) => {
            const tc = typeConfig[asset.type];
            return (
              <div key={asset.id} className="px-5 py-3.5 hover:bg-slate-800/30 transition-colors">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${tc.color}`}>
                      {tc.icon}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <p className="text-slate-200 text-sm font-medium">{tc.label}</p>
                    <p className="text-slate-500 text-xs truncate mt-0.5">{asset.location_description}</p>
                  </div>
                  <div className="col-span-2">
                    {asset.roads && (
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        {asset.roads.highway_code}
                      </span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <MapPin className="w-3 h-3" />
                      {asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${scoreBarColor(asset.current_score)} rounded-full`} style={{ width: `${asset.current_score}%` }} />
                      </div>
                      <span className="text-slate-300 text-xs font-medium w-7 text-right">{asset.current_score}%</span>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <ScoreBadge status={asset.current_status} size="sm" />
                  </div>
                  <div className="col-span-1">
                    <span className="text-slate-500 text-xs">{formatDate(asset.last_inspected)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
