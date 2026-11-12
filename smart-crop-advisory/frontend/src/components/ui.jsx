import { Loader2, AlertTriangle } from 'lucide-react';

export const inr = (n) => '₹' + Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
export const num = (n, d = 1) => Number(n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: d });
export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
export const pretty = (s) =>
  (s ?? '').toString().toLowerCase().replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500';
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50';
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50';

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorBox({ children }) {
  if (!children) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function Card({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-lg font-semibold text-slate-800">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const LABEL_STYLES = {
  'Highly Suitable': 'bg-emerald-100 text-emerald-800',
  Suitable: 'bg-lime-100 text-lime-800',
  'Moderately Suitable': 'bg-amber-100 text-amber-800',
  'Not Recommended': 'bg-red-100 text-red-700',
};

export function LabelBadge({ label }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${LABEL_STYLES[label] || 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  );
}

const RISK_STYLES = {
  LOW: 'bg-emerald-50 text-emerald-700',
  MEDIUM: 'bg-amber-50 text-amber-700',
  HIGH: 'bg-red-50 text-red-700',
};

export function RiskBadge({ risk }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_STYLES[risk] || 'bg-slate-100 text-slate-700'}`}>
      {pretty(risk)} risk
    </span>
  );
}

export function ScoreBar({ value }) {
  const color =
    value >= 80 ? 'bg-emerald-500' : value >= 65 ? 'bg-lime-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const width = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-100">
      <div className={`h-2 rounded-full ${color}`} style={{ width: `${width}%` }} />
    </div>
  );
}

export function Stat({ label, value, sub }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold text-slate-800">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}
