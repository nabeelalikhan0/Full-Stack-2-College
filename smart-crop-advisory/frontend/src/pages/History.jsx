import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { Card, ErrorBox, Spinner, btnPrimary, fmtDate, num } from '../components/ui';

export default function History() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/recommendations')
      .then((r) => setItems(r.data))
      .catch((e) => setError(errMsg(e)));
  }, []);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!items) return <Spinner />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Recommendation history</h1>
      <Card>
        {items.length === 0 ? (
          <div className="space-y-3 text-sm text-slate-500">
            <p>No recommendations yet.</p>
            <Link to="/recommend" className={btnPrimary}>
              Create your first one
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Location</th>
                  <th className="py-2 pr-4 font-medium">Season</th>
                  <th className="py-2 pr-4 font-medium">Soil</th>
                  <th className="py-2 pr-4 font-medium">Area</th>
                  <th className="py-2 pr-4 font-medium">Top crop</th>
                  <th className="py-2 pr-4 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-slate-500">{fmtDate(h.createdAt)}</td>
                    <td className="py-2 pr-4">{h.district ? `${h.district}, ${h.state}` : h.state}</td>
                    <td className="py-2 pr-4">{h.season}</td>
                    <td className="py-2 pr-4">{h.soilType}</td>
                    <td className="py-2 pr-4">{num(h.landAreaHa)} ha</td>
                    <td className="py-2 pr-4 font-medium">
                      {h.topCrop} <span className="text-slate-400">({num(h.topScore)})</span>
                    </td>
                    <td className="py-2 pr-4">
                      <Link to={`/results/${h.id}`} className="font-medium text-emerald-700 hover:underline">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
