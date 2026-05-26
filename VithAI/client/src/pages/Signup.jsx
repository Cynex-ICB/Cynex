import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';

export default function Signup() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      loginWithToken(data.token, data.user);
      toast.success('Account created');
      navigate(data.user.role === 'admin' ? '/admin/assessments' : '/student/assessments');
    } catch (error) {
      toast.error(error.details?.join(', ') || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="w-full max-w-3xl overflow-hidden rounded-md border border-white/70 bg-white shadow-lift">
        <div className="bg-night px-6 py-5 text-white sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-brand">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-lg font-black">VithAI</p>
                <p className="text-xs font-semibold text-slate-300">Create your workspace account</p>
              </div>
            </div>
            <ShieldCheck className="hidden h-6 w-6 text-teal-300 sm:block" />
          </div>
        </div>

        <form onSubmit={submit} className="p-6 sm:p-8">
          <p className="text-sm font-bold uppercase text-brand">Get started</p>
          <h1 className="mt-2 text-3xl font-black text-ink">Signup</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Create an admin or student account.</p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Full Name
              <input
                required
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                className="field"
              />
            </label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
                className="field"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Password
              <input
                type="password"
                minLength="8"
                required
                value={form.password}
                onChange={(event) => update('password', event.target.value)}
                className="field"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Confirm Password
              <input
                type="password"
                minLength="8"
                required
                value={form.confirmPassword}
                onChange={(event) => update('confirmPassword', event.target.value)}
                className="field"
              />
            </label>
            <label className="text-sm font-bold text-slate-700 md:col-span-2">
              Role
              <select value={form.role} onChange={(event) => update('role', event.target.value)} className="field">
                <option value="admin">Admin</option>
                <option value="student">Student</option>
              </select>
            </label>
          </div>
          <button disabled={loading} className="btn-primary mt-6 w-full">
            <UserPlus className="h-4 w-4" />
            {loading ? 'Creating account...' : 'Signup'}
          </button>
          <p className="mt-5 flex items-center justify-center gap-1 text-center text-sm text-slate-600">
            Already have an account?
            <Link className="inline-flex items-center gap-1 font-black text-brand" to="/login">
              Login <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
