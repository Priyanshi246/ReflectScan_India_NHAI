import { useEffect, useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Asset } from '../types';
import ScoreBadge from '../components/ScoreBadge';

const highways = [
  { code: 'NH-48', name: 'Delhi-Mumbai', points: [[28, 30], [24, 35], [20, 40], [18, 45]] as [number, number][], color: '#06b6d4' },
  { code: 'NH-44', name: 'Golden Quadrilateral N', points: [[29, 32], [30, 40], [31, 48], [32, 54]] as [number, number][], color: '#8b5cf6' },
  { code: 'NH-16', name: 'Chennai-Kolkata', points: [[13, 80], [15, 80], [17, 82], [19, 84], [22, 87]] as [number, number][], color: '#10b981' },
  { code: 'NH-66', name: 'Mumbai-Pune', points: [[18, 46], [18, 50], [18, 53]] as [number, number][], color: '#f59e0b' },
  { code: 'NH-44S', name: 'Bengaluru-Hyderabad', points: [[12, 77], [14, 77], [16, 78], [17, 78]] as [number, number][], color: '#ef4444' },
  { code: 'NH-19', name: 'Kolkata-Varanasi', points: [[22, 88], [24, 84], [25, 80]] as [number, number][], color: '#f97316' },
];

const latToY = (lat: number) => ((35 - lat) / 28) * 500;
const lonToX = (lon: number) => ((lon - 67) / 30) * 620;

const assetLatToY = (lat: number) => ((35 - lat) / 28) * 500;
const assetLonToX = (lon: number) => ((lon - 67) / 30) * 620;

const statusDotColor: Record<string, string> = { pass: '#10b981', warning: '#f59e0b', fail: '#ef4444', unknown: '#64748b' };

export default function MapView() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    setLoading(true);
    const { data } = await supabase
      .from('assets')
      .select('*, roads(name, highway_code)');
    if (data) setAssets(data as Asset[]);
    setLoading(false);
  }

  let filtered = assets;
  if (typeFilter !== 'all') filtered = filtered.filter(a => a.type === typeFilter);
  if (statusFilter !== 'all') filtered = filtered.filter(a => a.current_status === statusFilter);

  const stats = {
    pass: assets.filter(a => a.current_status === 'pass').length,
    warning: assets.filter(a => a.current_status === 'warning').length,
    fail: assets.filter(a => a.current_status === 'fail').length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <div>
            <p className="text-emerald-400 font-bold text-lg">{stats.pass}</p>
            <p className="text-slate-400 text-xs">Pass (≥75%)</p>
          </div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <div>
            <p className="text-amber-400 font-bold text-lg">{stats.warning}</p>
            <p className="text-slate-400 text-xs">Warning (60-74%)</p>
          </div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
          <div>
            <p className="text-red-400 font-bold text-lg">{stats.fail}</p>
            <p className="text-slate-400 text-xs">Fail (&lt;60%)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300 text-sm font-medium">India Highway Network</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.min(z + 0.2, 2))} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-slate-500 text-xs ml-1">{Math.round(zoom * 100)}%</span>
            </div>
          </div>

          <div className="relative overflow-auto" style={{ height: '500px' }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              </div>
            ) : (
              <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', transition: 'transform 0.3s ease' }}>
                <svg width="620" height="500" className="bg-slate-950">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="620" height="500" fill="url(#grid)" />

                  <text x="310" y="30" fill="#334155" fontSize="11" textAnchor="middle" fontFamily="monospace">INDIA - NHAI HIGHWAY NETWORK</text>

                  {highways.map((hw) => {
                    const pts = hw.points.map(([lat, lon]) => `${lonToX(lon)},${latToY(lat)}`).join(' ');
                    return (
                      <g key={hw.code}>
                        <polyline points={pts} fill="none" stroke={hw.color} strokeWidth="2.5" strokeOpacity="0.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="8 3" />
                        <polyline points={pts} fill="none" stroke={hw.color} strokeWidth="1" strokeOpacity="0.3" />
                        {hw.points[0] && (
                          <text
                            x={lonToX(hw.points[0][1]) + 5}
                            y={latToY(hw.points[0][0]) - 5}
                            fill={hw.color}
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {hw.code}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {filtered.map((asset) => {
                    const cx = assetLonToX(Number(asset.longitude));
                    const cy = assetLatToY(Number(asset.latitude));
                    const color = statusDotColor[asset.current_status];
                    const isSelected = selected?.id === asset.id;
                    return (
                      <g key={asset.id} onClick={() => setSelected(isSelected ? null : asset)} style={{ cursor: 'pointer' }}>
                        {isSelected && (
                          <circle cx={cx} cy={cy} r="14" fill={color} fillOpacity="0.15" />
                        )}
                        <circle cx={cx} cy={cy} r={isSelected ? 7 : 5} fill={color} fillOpacity="0.9" />
                        <circle cx={cx} cy={cy} r={isSelected ? 7 : 5} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
                        {asset.current_status === 'fail' && (
                          <circle cx={cx} cy={cy} r="9">
                            <animate attributeName="r" values="5;12;5" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="fill" values={color} dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  <g>
                    <text x="20" y="480" fill="#475569" fontSize="8" fontFamily="sans-serif">N 8°</text>
                    <text x="20" y="20" fill="#475569" fontSize="8" fontFamily="sans-serif">N 36°</text>
                    <text x="20" y="250" fill="#475569" fontSize="8" fontFamily="sans-serif">N 22°</text>
                  </g>
                </svg>
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t border-slate-800 flex items-center gap-6">
            {highways.map(hw => (
              <div key={hw.code} className="flex items-center gap-1.5">
                <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: hw.color }} />
                <span className="text-slate-500 text-xs">{hw.code}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-white text-sm font-semibold mb-3">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Asset Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="all">All Types</option>
                  <option value="road_sign">Road Signs</option>
                  <option value="lane_marking">Lane Markings</option>
                  <option value="road_stud">Road Studs</option>
                  <option value="delineator">Delineators</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full appearance-none bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="all">All Status</option>
                  <option value="pass">Pass</option>
                  <option value="warning">Warning</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
            </div>
          </div>

          {selected ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-semibold">Asset Detail</h3>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-slate-300 text-xs">Close</button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300 text-sm capitalize">{selected.type.replace('_', ' ')}</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{selected.location_description}</p>
                <div className="pt-2">
                  <ScoreBadge score={selected.current_score} status={selected.current_status} size="md" />
                </div>
                <div className="bg-slate-800 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Highway</span>
                    <span className="text-cyan-400 font-mono">{selected.roads?.highway_code}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Latitude</span>
                    <span className="text-slate-300">{Number(selected.latitude).toFixed(4)}°N</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Longitude</span>
                    <span className="text-slate-300">{Number(selected.longitude).toFixed(4)}°E</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Score</span>
                    <span className={`font-bold ${selected.current_score >= 75 ? 'text-emerald-400' : selected.current_score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                      {selected.current_score}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-slate-500 text-sm text-center py-4">Click an asset marker on the map to view details</p>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">Legend</h3>
            <div className="space-y-2">
              {[
                { color: 'bg-emerald-400', label: 'Pass (≥75%)', sub: 'Compliant' },
                { color: 'bg-amber-400', label: 'Warning (60-74%)', sub: 'Monitor' },
                { color: 'bg-red-400', label: 'Fail (<60%)', sub: 'Immediate action' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                  <div>
                    <p className="text-slate-300 text-xs">{item.label}</p>
                    <p className="text-slate-600 text-xs">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
