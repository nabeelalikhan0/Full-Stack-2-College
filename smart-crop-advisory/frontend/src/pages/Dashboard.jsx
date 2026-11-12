import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, Repeat, Sprout } from 'lucide-react';
import api, { errMsg } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card, ErrorBox, Spinner, Stat, btnPrimary, fmtDate, num } from '../components/ui';

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/recommendations')
      .then((r) => setHistory(r.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!history) return <Spinner />;

  const last = history[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name}</h1>
        <p className="text-slate-500">Plan crops, irrigation and inputs for your farm in one place.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Stat label="Recommendations" value={history.length} />
        <Stat label="Latest top crop" value={last ? last.topCrop : '—'} sub={last ? `${num(last.topScore)} / 100` : 'Run your first one'} />
        <Stat label="Latest season" value={last ? last.season : '—'} sub={last ? last.state : ''} />
      </div>

      <Card title="Get started">
        <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-3">
          <div className="flex gap-3">
            <Sprout className="h-6 w-6 shrink-0 text-emerald-600" />
            Enter your soil, water, season and climate to rank 14 crops with factor-by-factor reasoning.
          </div>
          <div className="flex gap-3">
            <Droplets className="h-6 w-6 shrink-0 text-sky-600" />
            Open a farm plan for any crop to get a stage-wise irrigation schedule and water balance.
          </div>
          <div className="flex gap-3">
            <Repeat className="h-6 w-6 shrink-0 text-amber-600" />
            See rotation advice plus estimated seed, fertilizer, labour, cost and yield.
          </div>
        </div>
        <Link to="/recommend" className={`${btnPrimary} mt-5`}>
          New recommendation <ArrowRight className="h-4 w-4" />
        </Link>
      </Card>

      <Card title="Recent recommendations" action={<Link to="/history" className="text-sm font-medium text-emerald-700 hover:underline">View all</Link>}>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {history.slice(0, 4).map((h) => (
              <li key={h.id}>
                <Link to={`/results/${h.id}`} className="flex items-center justify-between gap-2 py-3 hover:bg-slate-50">
                  <span>
                    <span className="font-medium text-slate-800">{h.topCrop}</span>{' '}
                    <span className="text-sm text-slate-500">
                      · {h.season} · {h.district || h.state} · {num(h.landAreaHa)} ha
                    </span>
                  </span>
                  <span className="text-xs text-slate-400">{fmtDate(h.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
