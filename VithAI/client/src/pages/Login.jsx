import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiFetch } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      loginWithToken(data.token, data.user);
      toast.success('Logged in successfully');
      navigate(data.user.role === 'admin' ? '/admin/assessments' : '/student/assessments');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-md border border-white/70 bg-white shadow-lift lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-night p-8 text-white lg:block">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-brand">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-black">VithAI</p>
              <p className="text-xs font-semibold text-slate-300">Placement readiness workspace</p>
            </div>
          </div>
          <div className="mt-16">
            <p className="text-sm font-bold uppercase text-teal-300">Aptitude platform</p>
            <h1 className="mt-3 text-4xl font-black leading-tight">
              Assessments, attempts, and analytics in one clean console.
            </h1>
          </div>
          <div className="mt-10 grid gap-3 text-sm text-slate-300">
            {['AI generated MCQs', 'Role based dashboards', 'Detailed result analytics'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md bg-white/[0.06] p-3">
                <CheckCircle2 className="h-4 w-4 text-teal-300" />
                <span className="font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={submit} className="p-6 sm:p-10">
          <div className="lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-night text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="text-xl font-black text-ink">VithAI</p>
            </div>
          </div>
          <p className="mt-8 text-sm font-bold uppercase text-brand lg:mt-0">Welcome back</p>
          <h2 className="mt-2 text-3xl font-black text-ink">Login</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Continue to your assessment workspace.</p>

          <label className="mt-8 block text-sm font-bold text-slate-700">
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="field"
              placeholder="you@example.com"
            />
          </label>
          <label className="mt-4 block text-sm font-bold text-slate-700">
            Password
            <input
              type="password"
              required
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="field"
              placeholder="Enter your password"
            />
          </label>
          <button disabled={loading} className="btn-primary mt-6 w-full">
            <LogIn className="h-4 w-4" />
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p className="mt-5 flex items-center justify-center gap-1 text-center text-sm text-slate-600">
            New here?
            <Link className="inline-flex items-center gap-1 font-black text-brand" to="/signup">
              Create account <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
