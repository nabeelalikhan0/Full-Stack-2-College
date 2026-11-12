import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import api, { errMsg } from '../api';
import { Card, ErrorBox, LabelBadge, RiskBadge, ScoreBar, Spinner, btnGhost, btnPrimary, num, pretty } from '../components/ui';

function FactorList({ crop }) {
  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      {crop.factors.map((f) => (
        <div key={f.factor}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">
              {f.factor} <span className="text-xs font-normal text-slate-400">(weight {num(f.weight, 0)}%)</span>
            </span>
            <span className="font-semibold text-slate-700">{num(f.score)}</span>
          </div>
          <ScoreBar value={f.score} />
          <p className="mt-1 text-xs text-slate-500">{f.reasoning}</p>
        </div>
      ))}
      {crop.warnings.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          {crop.warnings.map((w) => (
            <li key={w} className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CompareTable({ crops }) {
  const rows = [
    ['Suitability score', (c) => num(c.score)],
    ['Label', (c) => c.label],
    ['Season', (c) => pretty(c.season)],
    ['Category', (c) => pretty(c.category)],
    ['Risk', (c) => pretty(c.risk)],
    ['Water need (mm)', (c) => num(c.waterReqMm, 0)],
    ['Duration (days)', (c) => c.durationDays],
    ['Expected yield (qtl/ha)', (c) => num(c.yieldQtlPerHa)],
  ];
  const factorNames = crops[0].factors.map((f) => f.factor);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="py-2 pr-4 font-medium">Attribute</th>
            {crops.map((c) => (
              <th key={c.cropId} className="py-2 pr-4 font-semibold text-slate-800">
                {c.crop}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, fn]) => (
            <tr key={label} className="border-b border-slate-100">
              <td className="py-2 pr-4 text-slate-500">{label}</td>
              {crops.map((c) => (
                <td key={c.cropId} className="py-2 pr-4">
                  {fn(c)}
                </td>
              ))}
            </tr>
          ))}
          {factorNames.map((name, i) => (
            <tr key={name} className="border-b border-slate-100 bg-slate-50/60">
              <td className="py-2 pr-4 text-slate-500">{name} score</td>
              {crops.map((c) => (
                <td key={c.cropId} className="py-2 pr-4">
                  {num(c.factors[i].score)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Results() {
  const { id } = useParams();
  const [rec, setRec] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);
  const [compare, setCompare] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    api
      .get(`/recommendations/${id}`)
      .then((r) => setRec(r.data))
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!rec) return <Spinner />;

  const visible = showAll ? rec.results : rec.results.slice(0, 6);
  const picked = rec.results.filter((r) => compare.includes(r.cropId));
  const toggleCompare = (cropId) =>
    setCompare((c) => (c.includes(cropId) ? c.filter((x) => x !== cropId) : c.length < 3 ? [...c, cropId] : c));
  const input = rec.input;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Recommended crops</h1>
        <p className="text-sm text-slate-500">
          {pretty(input.season)} · {input.district ? `${input.district}, ` : ''}
          {input.state} · {input.soilType} soil (pH {input.soilPh}) · {num(input.landAreaHa)} ha · {input.irrigationMethod} irrigation
        </p>
      </div>

      {picked.length >= 2 && (
        <Card
          title="Side-by-side comparison"
          action={
            <button className={btnGhost} onClick={() => setCompare([])}>
              Clear
            </button>
          }
        >
          <CompareTable crops={picked} />
        </Card>
      )}
      {picked.length === 1 && <p className="text-sm text-slate-500">Select one more crop to compare (max 3).</p>}

      <div className="space-y-3">
        {visible.map((c) => (
          <Card key={c.cropId}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
                {c.rank}
              </span>
              <div className="min-w-[8rem] flex-1">
                <div className="text-lg font-semibold text-slate-800">{c.crop}</div>
                <div className="text-xs text-slate-500">
                  {pretty(c.category)} · {pretty(c.season)} · {c.durationDays} days · {num(c.yieldQtlPerHa)} qtl/ha
                </div>
              </div>
              <RiskBadge risk={c.risk} />
              <LabelBadge label={c.label} />
              <div className="w-16 text-right text-xl font-bold text-slate-800">{num(c.score)}</div>
            </div>
            <div className="mt-3">
              <ScoreBar value={c.score} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button className={btnGhost} onClick={() => setOpen(open === c.cropId ? null : c.cropId)}>
                {open === c.cropId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Why this score?
              </button>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={compare.includes(c.cropId)} onChange={() => toggleCompare(c.cropId)} />
                Compare
              </label>
              <Link to={`/plan/${rec.id}/${c.cropId}`} className={`${btnPrimary} ml-auto`}>
                Farm plan
              </Link>
            </div>
            {open === c.cropId && <FactorList crop={c} />}
          </Card>
        ))}
      </div>

      {rec.results.length > 6 && (
        <button className={btnGhost} onClick={() => setShowAll(!showAll)}>
          {showAll ? 'Show top 6 only' : `Show all ${rec.results.length} crops`}
        </button>
      )}
    </div>
  );
}
