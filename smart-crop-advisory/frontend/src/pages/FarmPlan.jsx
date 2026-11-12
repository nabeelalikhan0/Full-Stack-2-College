import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import api, { errMsg } from '../api';
import { Card, ErrorBox, LabelBadge, Spinner, Stat, fmtDate, inr, num, pretty } from '../components/ui';

export default function FarmPlan() {
  const { id, cropId } = useParams();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/recommendations/${id}/plan/${cropId}`)
      .then((r) => setPlan(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [id, cropId]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!plan) return <Spinner label="Building farm plan…" />;

  const { crop, irrigation: irr, rotation: rot, resources: res, input } = plan;
  const deficit = irr.status === 'DEFICIT';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to={`/results/${id}`} className="text-sm text-emerald-700 hover:underline">
            ← Back to recommendations
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Farm plan: {crop.crop}</h1>
          <p className="text-sm text-slate-500">
            Advisory {plan.advisoryId} · generated {fmtDate(plan.generatedAt)} · {num(input.landAreaHa)} ha · {pretty(input.season)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LabelBadge label={crop.label} />
          <span className="text-xl font-bold text-slate-800">{num(crop.score)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total cost" value={inr(res.totalCost)} sub={`${inr(res.costPerQuintal)} per quintal`} />
        <Stat label="Expected yield" value={`${num(res.expectedYieldQtl)} qtl`} />
        <Stat label="Water needed" value={`${num(res.waterM3, 0)} m³`} sub={`${num(irr.grossIrrigationMm, 0)} mm gross`} />
        <Stat label="Labour" value={`${num(res.labourDays, 0)} days`} />
      </div>

      <Card
        title="Irrigation plan"
        action={
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              deficit ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            Water {deficit ? 'deficit' : 'surplus'}: {num(Math.abs(irr.balanceMm), 0)} mm
          </span>
        }
      >
        <p className="mb-4 text-sm text-slate-600">
          {crop.crop} needs {num(irr.cropWaterMm, 0)} mm over the season. Effective rainfall covers {num(irr.effectiveRainMm, 0)} mm,
          leaving {num(irr.netIrrigationMm, 0)} mm net. With {irr.method} irrigation ({Math.round(irr.efficiency * 100)}% efficient) you
          must apply {num(irr.grossIrrigationMm, 0)} mm against {num(irr.availableWaterMm, 0)} mm available.
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={irr.schedule}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
              <YAxis unit=" mm" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="waterMm" name="Water (mm)" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2 pr-4 font-medium">Stage</th>
                <th className="py-2 pr-4 font-medium">Days</th>
                <th className="py-2 pr-4 font-medium">Water (mm)</th>
                <th className="py-2 pr-4 font-medium">Volume (m³)</th>
              </tr>
            </thead>
            <tbody>
              {irr.schedule.map((s) => (
                <tr key={s.stage} className="border-b border-slate-100">
                  <td className="py-2 pr-4">
                    {s.stage}
                    {s.critical && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">critical</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {s.startDay}–{s.endDay}
                  </td>
                  <td className="py-2 pr-4">{num(s.waterMm)}</td>
                  <td className="py-2 pr-4">{num(s.volumeM3, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {irr.warnings.length > 0 && (
          <ul className="mt-4 space-y-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            {irr.warnings.map((w) => (
              <li key={w} className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Crop rotation">
        <p className="text-sm text-slate-600">
          <span className="font-semibold">After {rot.previousCrop}:</span> compatibility {num(rot.compatibilityScore, 0)}/100. {rot.compatibilityNote}
        </p>
        <h3 className="mt-4 text-sm font-semibold text-slate-700">Suggested sequence</h3>
        <div className="mt-2 flex flex-wrap items-stretch gap-2">
          {rot.sequence.map((s, i) => (
            <div key={`${s.season}-${s.crop}`} className="flex items-center gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <div className="text-xs uppercase text-emerald-700">{pretty(s.season)}</div>
                <div className="font-semibold text-slate-800">{s.crop}</div>
              </div>
              {i < rot.sequence.length - 1 && <ArrowRight className="h-4 w-4 text-slate-400" />}
            </div>
          ))}
        </div>
        {rot.nextOptions.length > 0 && (
          <>
            <h3 className="mt-5 text-sm font-semibold text-slate-700">Best crops for the next season</h3>
            <ul className="mt-2 divide-y divide-slate-100 text-sm">
              {rot.nextOptions.map((o) => (
                <li key={o.crop} className="py-2">
                  <span className="font-medium text-slate-800">{o.crop}</span>{' '}
                  <span className="text-slate-400">· {pretty(o.season)} · score {num(o.score, 0)}</span>
                  <div className="text-xs text-slate-500">{o.reason}</div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card title="Resource & cost estimate">
        <table className="w-full text-sm">
          <tbody>
            {[
              ['Seed', `${num(res.seedKg)} kg`, res.seedCost],
              ['Fertilizer', `Urea ${num(res.ureaKg, 0)} kg · DAP ${num(res.dapKg, 0)} kg · MOP ${num(res.mopKg, 0)} kg`, res.fertilizerCost],
              ['Labour', `${num(res.labourDays, 0)} worker-days`, res.labourCost],
              ['Irrigation water', `${num(res.waterM3, 0)} m³`, res.irrigationCost],
              ['Land prep, pesticides & other', '—', res.otherCultivationCost],
            ].map(([label, qty, cost]) => (
              <tr key={label} className="border-b border-slate-100">
                <td className="py-2 pr-4 font-medium text-slate-700">{label}</td>
                <td className="py-2 pr-4 text-slate-500">{qty}</td>
                <td className="py-2 text-right">{inr(cost)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-3 font-bold text-slate-800" colSpan={2}>
                Estimated total
              </td>
              <td className="py-3 text-right text-lg font-bold text-slate-800">{inr(res.totalCost)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-2 text-xs text-slate-400">
          Figures are indicative estimates from sample crop data and configurable input prices; validate locally before purchasing inputs.
        </p>
      </Card>
    </div>
  );
}
