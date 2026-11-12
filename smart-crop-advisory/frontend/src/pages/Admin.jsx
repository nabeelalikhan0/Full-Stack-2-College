import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Plus, Trash2 } from 'lucide-react';
import api, { errMsg } from '../api';
import { Card, ErrorBox, Spinner, Stat, btnGhost, btnPrimary, fmtDate, inputCls, num, pretty } from '../components/ui';

const SOILS = ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy'];
const CATEGORIES = ['CEREAL', 'PULSE', 'OILSEED', 'FIBER', 'CASH_CROP', 'VEGETABLE'];
const SEASONS = ['KHARIF', 'RABI', 'ZAID', 'YEAR_ROUND'];
const RISKS = ['LOW', 'MEDIUM', 'HIGH'];
const NUM_FIELDS = [
  ['waterReqMm', 'Water need (mm)'],
  ['phMin', 'pH min'],
  ['phMax', 'pH max'],
  ['tempMin', 'Temp min (°C)'],
  ['tempMax', 'Temp max (°C)'],
  ['rainfallMinMm', 'Min rainfall (mm)'],
  ['durationDays', 'Duration (days)'],
  ['yieldQtlPerHa', 'Yield (qtl/ha)'],
  ['seedKgPerHa', 'Seed (kg/ha)'],
  ['seedPricePerKg', 'Seed price (₹/kg)'],
  ['nKgPerHa', 'Nitrogen (kg/ha)'],
  ['pKgPerHa', 'Phosphorus (kg/ha)'],
  ['kKgPerHa', 'Potash (kg/ha)'],
  ['labourDaysPerHa', 'Labour (days/ha)'],
  ['baseCostPerHa', 'Other cost (₹/ha)'],
];

const emptyCrop = () => ({
  name: '',
  category: 'CEREAL',
  season: 'KHARIF',
  suitableSoils: [],
  risk: 'MEDIUM',
  nitrogenFixing: false,
  ...Object.fromEntries(NUM_FIELDS.map(([k]) => [k, ''])),
});

function StatsTab() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((r) => setStats(r.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!stats) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Users" value={stats.totalUsers} />
        <Stat label="Recommendations" value={stats.totalRecommendations} />
        <Stat label="Crops in database" value={stats.totalCrops} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Most recommended crops">
          {stats.popularCrops.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.popularCrops}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Times top-ranked" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <Card title="Activity by state">
          {stats.byState.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byState}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Recommendations" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
      <Card title="Latest activity">
        <ul className="divide-y divide-slate-100 text-sm">
          {stats.recent.map((r) => (
            <li key={r.id} className="flex flex-wrap justify-between gap-2 py-2">
              <span>
                <span className="font-medium">{r.topCrop}</span> ({num(r.topScore)}) · {r.state}
              </span>
              <span className="text-slate-400">
                {r.user} · {fmtDate(r.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function CropsTab() {
  const [crops, setCrops] = useState([]);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get('/crops')
      .then((r) => setCrops(r.data))
      .catch((e) => setError(errMsg(e)));

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const payload = { ...draft };
    NUM_FIELDS.forEach(([k]) => {
      payload[k] = Number(payload[k] || 0);
    });
    try {
      if (draft.id) await api.put(`/crops/${draft.id}`, payload);
      else await api.post('/crops', payload);
      setDraft(null);
      await load();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.name}?`)) return;
    try {
      await api.delete(`/crops/${c.id}`);
      await load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const toggleSoil = (soil) =>
    setDraft((d) => ({
      ...d,
      suitableSoils: d.suitableSoils.includes(soil) ? d.suitableSoils.filter((s) => s !== soil) : [...d.suitableSoils, soil],
    }));

  return (
    <div className="space-y-4">
      <ErrorBox>{error}</ErrorBox>

      {draft ? (
        <Card title={draft.id ? `Edit ${draft.name}` : 'Add crop'}>
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <input
                className={inputCls}
                placeholder="Crop name"
                required
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
              <select className={inputCls} value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {pretty(c)}
                  </option>
                ))}
              </select>
              <select className={inputCls} value={draft.season} onChange={(e) => setDraft({ ...draft, season: e.target.value })}>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>
                    {pretty(s)}
                  </option>
                ))}
              </select>
              <select className={inputCls} value={draft.risk} onChange={(e) => setDraft({ ...draft, risk: e.target.value })}>
                {RISKS.map((r) => (
                  <option key={r} value={r}>
                    {pretty(r)} risk
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <span className="font-medium text-slate-700">Suitable soils:</span>
              {SOILS.map((s) => (
                <label key={s} className="flex items-center gap-1">
                  <input type="checkbox" checked={draft.suitableSoils.includes(s)} onChange={() => toggleSoil(s)} /> {s}
                </label>
              ))}
              <label className="ml-auto flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={draft.nitrogenFixing}
                  onChange={(e) => setDraft({ ...draft, nitrogenFixing: e.target.checked })}
                />
                Nitrogen-fixing legume
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {NUM_FIELDS.map(([k, label]) => (
                <label key={k} className="block text-xs text-slate-500">
                  {label}
                  <input
                    className={`${inputCls} mt-1`}
                    type="number"
                    step="any"
                    required
                    value={draft[k]}
                    onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                  />
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button className={btnPrimary} disabled={busy || draft.suitableSoils.length === 0}>
                {busy ? 'Saving…' : 'Save crop'}
              </button>
              <button type="button" className={btnGhost} onClick={() => setDraft(null)}>
                Cancel
              </button>
            </div>
            {draft.suitableSoils.length === 0 && <p className="text-xs text-amber-700">Select at least one suitable soil.</p>}
          </form>
        </Card>
      ) : (
        <button className={btnPrimary} onClick={() => setDraft(emptyCrop())}>
          <Plus className="h-4 w-4" /> Add crop
        </button>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4 font-medium">Crop</th>
                <th className="py-2 pr-4 font-medium">Category</th>
                <th className="py-2 pr-4 font-medium">Season</th>
                <th className="py-2 pr-4 font-medium">Water (mm)</th>
                <th className="py-2 pr-4 font-medium">Yield (qtl/ha)</th>
                <th className="py-2 pr-4 font-medium" />
              </tr>
            </thead>
            <tbody>
              {crops.map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-medium">{c.name}</td>
                  <td className="py-2 pr-4">{pretty(c.category)}</td>
                  <td className="py-2 pr-4">{pretty(c.season)}</td>
                  <td className="py-2 pr-4">{num(c.waterReqMm, 0)}</td>
                  <td className="py-2 pr-4">{num(c.yieldQtlPerHa)}</td>
                  <td className="flex gap-3 py-2 pr-4">
                    <button className="font-medium text-emerald-700 hover:underline" onClick={() => setDraft({ ...c })}>
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => remove(c)} aria-label={`Delete ${c.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const WEIGHT_FIELDS = [
  ['soil', 'Soil type'],
  ['season', 'Season'],
  ['water', 'Water'],
  ['ph', 'Soil pH'],
  ['rotation', 'Crop rotation'],
  ['temperature', 'Temperature'],
  ['rainfall', 'Rainfall'],
];

function WeightsTab() {
  const [w, setW] = useState(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get('/admin/weights')
      .then((r) => setW(r.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  if (!w) return error ? <ErrorBox>{error}</ErrorBox> : <Spinner />;

  const sum = WEIGHT_FIELDS.reduce((acc, [k]) => acc + Number(w[k] || 0), 0);

  const save = async () => {
    setError('');
    setSaved(false);
    try {
      const payload = Object.fromEntries(WEIGHT_FIELDS.map(([k]) => [k, Number(w[k] || 0)]));
      const { data } = await api.put('/admin/weights', payload);
      setW(data);
      setSaved(true);
    } catch (e) {
      setError(errMsg(e));
    }
  };

  return (
    <Card title="Scoring weights">
      <p className="mb-4 text-sm text-slate-500">
        Weights are relative: the engine divides by their total, so they do not have to add up to 100. New recommendations use the
        saved values immediately.
      </p>
      <ErrorBox>{error}</ErrorBox>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {WEIGHT_FIELDS.map(([k, label]) => (
          <label key={k} className="block text-sm text-slate-600">
            {label}
            <input
              className={`${inputCls} mt-1`}
              type="number"
              min="0"
              step="1"
              value={w[k]}
              onChange={(e) => {
                setSaved(false);
                setW({ ...w, [k]: e.target.value });
              }}
            />
          </label>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button className={btnPrimary} onClick={save}>
          Save weights
        </button>
        <span className="text-sm text-slate-500">Total: {num(sum, 0)}</span>
        {saved && <span className="text-sm font-medium text-emerald-700">Saved</span>}
      </div>
    </Card>
  );
}

const TABS = [
  ['stats', 'Statistics'],
  ['crops', 'Crops'],
  ['weights', 'Scoring weights'],
];

export default function Admin() {
  const [tab, setTab] = useState('stats');
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">Admin dashboard</h1>
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === key ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'stats' && <StatsTab />}
      {tab === 'crops' && <CropsTab />}
      {tab === 'weights' && <WeightsTab />}
    </div>
  );
}
