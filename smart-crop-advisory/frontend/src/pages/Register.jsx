import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import { ErrorBox, btnPrimary, inputCls } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', state: '', district: '', village: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      nav('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex items-center gap-2 text-xl font-bold text-emerald-700">
          <Sprout className="h-7 w-7" /> Create your account
        </div>
        <ErrorBox>{error}</ErrorBox>
        <input className={inputCls} placeholder="Full name" required value={form.name} onChange={set('name')} />
        <input className={inputCls} type="email" placeholder="Email" required value={form.email} onChange={set('email')} />
        <input
          className={inputCls}
          type="password"
          placeholder="Password (min 6 characters)"
          minLength={6}
          required
          value={form.password}
          onChange={set('password')}
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input className={inputCls} placeholder="State" value={form.state} onChange={set('state')} />
          <input className={inputCls} placeholder="District" value={form.district} onChange={set('district')} />
          <input className={inputCls} placeholder="Village" value={form.village} onChange={set('village')} />
        </div>
        <button className={`${btnPrimary} w-full`} disabled={busy}>
          {busy ? 'Creating account…' : 'Register'}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
