import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { Card, ErrorBox, Spinner, btnGhost, btnPrimary, inputCls, pretty } from '../components/ui';

const RAIN_SHARE = { KHARIF: 0.75, RABI: 0.1, ZAID: 0.08 };
const TEMP_KEY = { KHARIF: 'tempKharif', RABI: 'tempRabi', ZAID: 'tempZaid' };
const STEPS = ['Location & land', 'Soil & water', 'Season & climate'];

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

const climateFor = (region, season) => ({
  temperatureC: String(region[TEMP_KEY[season]]),
  rainfallMm: String(Math.round(region.annualRainMm * RAIN_SHARE[season])),
});

export default function Recommend() {
  const nav = useNavigate();
  const [ref, setRef] = useState(null);
  const [crops, setCrops] = useState([]);
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    state: '',
    district: '',
    landAreaHa: '',
    soilType: '',
    soilPh: '6.8',
    waterAvailability: 'MEDIUM',
    irrigationMethod: '',
    season: 'KHARIF',
    previousCrop: '',
    temperatureC: '',
    rainfallMm: '',
  });

  useEffect(() => {
    Promise.all([api.get('/reference'), api.get('/crops')])
      .then(([r, c]) => {
        setRef(r.data);
        setCrops(c.data);
      })
      .catch((e) => setError(errMsg(e)));
  }, []);

  const states = useMemo(() => [...new Set((ref?.regions ?? []).map((r) => r.state))], [ref]);
  const districts = useMemo(() => (ref?.regions ?? []).filter((r) => r.state === form.state), [ref, form.state]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickState = (e) => setForm((f) => ({ ...f, state: e.target.value, district: '' }));

  // Choosing a district pre-fills typical soil, temperature and rainfall (all still editable).
  const pickDistrict = (e) => {
    const region = districts.find((r) => r.district === e.target.value);
    setForm((f) => ({
      ...f,
      district: e.target.value,
      ...(region ? { soilType: region.soil, ...climateFor(region, f.season) } : {}),
    }));
  };

  const pickSeason = (e) => {
    const season = e.target.value;
    const region = districts.find((r) => r.district === form.district);
    setForm((f) => ({ ...f, season, ...(region ? climateFor(region, season) : {}) }));
  };

  const valid = [
    () => form.state && Number(form.landAreaHa) > 0,
    () => form.soilType && form.irrigationMethod && Number(form.soilPh) >= 3 && Number(form.soilPh) <= 10,
    () => form.temperatureC !== '' && form.rainfallMm !== '' && Number(form.rainfallMm) >= 0,
  ];

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        landAreaHa: Number(form.landAreaHa),
        soilPh: Number(form.soilPh),
        temperatureC: Number(form.temperatureC),
        rainfallMm: Number(form.rainfallMm),
        previousCrop: form.previousCrop || null,
      };
      const { data } = await api.post('/recommendations', payload);
      nav(`/results/${data.id}`);
    } catch (e) {
      setError(errMsg(e));
      setBusy(false);
    }
  };

  if (!ref && !error) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-slate-800">New crop recommendation</h1>

      <ol className="flex items-center gap-2 text-sm">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                i <= step ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </span>
            <span className={i === step ? 'font-semibold text-slate-800' : 'text-slate-500'}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-slate-300" />}
          </li>
        ))}
      </ol>

      <ErrorBox>{error}</ErrorBox>

      {ref && (
        <Card>
          {step === 0 && (
            <div className="space-y-4">
              <Field label="State">
                <select className={inputCls} value={form.state} onChange={pickState}>
                  <option value="">Select state…</option>
                  {states.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="District" hint="Pre-fills typical soil, temperature and rainfall for the region.">
                <select className={inputCls} value={form.district} onChange={pickDistrict} disabled={!form.state}>
                  <option value="">Select district…</option>
                  {districts.map((r) => (
                    <option key={r.district}>{r.district}</option>
                  ))}
                </select>
              </Field>
              <Field label="Land area (hectares)">
                <input className={inputCls} type="number" min="0.1" step="0.1" value={form.landAreaHa} onChange={set('landAreaHa')} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <Field label="Soil type">
                <select className={inputCls} value={form.soilType} onChange={set('soilType')}>
                  <option value="">Select soil…</option>
                  {ref.soils.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} — {s.description}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Soil pH (3–10)">
                <input className={inputCls} type="number" min="3" max="10" step="0.1" value={form.soilPh} onChange={set('soilPh')} />
              </Field>
              <Field label="Water availability" hint="Seasonal irrigation water you can draw on.">
                <select className={inputCls} value={form.waterAvailability} onChange={set('waterAvailability')}>
                  {ref.waterLevels.map((w) => (
                    <option key={w.level} value={w.level}>
                      {pretty(w.level)} (~{w.mm} mm per season)
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Irrigation method">
                <select className={inputCls} value={form.irrigationMethod} onChange={set('irrigationMethod')}>
                  <option value="">Select method…</option>
                  {ref.irrigationMethods.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({Math.round(m.efficiency * 100)}% efficient)
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Field label="Planting season">
                <select className={inputCls} value={form.season} onChange={pickSeason}>
                  {ref.seasons.map((s) => (
                    <option key={s} value={s}>
                      {pretty(s)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Previous crop" hint="Used for the crop-rotation score.">
                <select className={inputCls} value={form.previousCrop} onChange={set('previousCrop')}>
                  <option value="">None / fallow</option>
                  {crops.map((c) => (
                    <option key={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Average temperature (°C)">
                  <input className={inputCls} type="number" step="0.5" value={form.temperatureC} onChange={set('temperatureC')} />
                </Field>
                <Field label="Seasonal rainfall (mm)">
                  <input className={inputCls} type="number" min="0" step="10" value={form.rainfallMm} onChange={set('rainfallMm')} />
                </Field>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button className={btnGhost} disabled={step === 0 || busy} onClick={() => setStep(step - 1)}>
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button className={btnPrimary} disabled={!valid[step]()} onClick={() => setStep(step + 1)}>
                Next
              </button>
            ) : (
              <button className={btnPrimary} disabled={!valid[step]() || busy} onClick={submit}>
                {busy ? 'Analysing…' : 'Get recommendations'}
              </button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
