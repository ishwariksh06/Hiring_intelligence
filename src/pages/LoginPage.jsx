import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Button from '../components/common/Button';
import { redirectByRole } from '../utils/redirectByRole';
import { AGENCY } from '../config/agency';

// Demo accounts are shown only when VITE_SHOW_DEMO_ACCOUNTS=true (set on the demo deployment).
const SHOW_DEMO = import.meta.env.VITE_SHOW_DEMO_ACCOUNTS === 'true';

const DEMO_ACCOUNTS = [
  { label: 'Administrator (agency)', email: 'ishwari@hiringintelligence.io' },
  { label: 'Client recruiter (Northwind Logistics)', email: 'rajesh.iyer@northwind.example' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: SHOW_DEMO ? { email: 'ishwari@hiringintelligence.io', password: 'password123' } : { email: '', password: '' },
  });

  async function onSubmit(values) {
    try {
      const user = await login(values);
      redirectByRole(user.role, navigate);
    } catch (err) {
      setError('root', { message: err.message || 'Login failed' });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-base font-semibold text-slate-900">{AGENCY.name}</p>
          <p className="mt-1 text-sm text-slate-500">Sign in to the recruitment workspace</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Work email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="you@company.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
              placeholder="Password"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          {errors.root && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{errors.root.message}</p>
          )}

          <Button type="submit" loading={isSubmitting} className="w-full">
            Sign in
          </Button>
        </form>

        {SHOW_DEMO && (
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Demo accounts</p>
          <ul className="mt-2 space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <li key={acc.email}>
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', acc.email);
                    setValue('password', 'password123');
                  }}
                  className="text-left text-xs text-slate-500 hover:text-slate-800"
                >
                  <span className="font-medium text-slate-700">{acc.label}</span>
                  <span className="block text-slate-400">{acc.email} · password123</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        )}
      </div>
    </div>
  );
}
