import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface FormErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): FormErrors {
  const errors: FormErrors = {};

  if (!email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  return errors;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(email, password));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (touched.email) setErrors(validate(e.target.value, password));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (touched.password) setErrors(validate(email, e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // touch all fields so errors show
    setTouched({ email: true, password: true });
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const { token, user } = res.data;
      setAuth(user, token);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);

      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'FACTORY') navigate('/factory');
      else navigate('/buyer');
    } catch (err: any) {
      // map server validation errors back to fields
      const serverErrors: { field: string; message: string }[] = err?.response?.data?.errors;
      if (Array.isArray(serverErrors)) {
        const mapped: FormErrors = {};
        serverErrors.forEach((e) => {
          if (e.field === 'email') mapped.email = e.message;
          if (e.field === 'password') mapped.password = e.message;
        });
        setErrors(mapped);
      } else {
        toast.error(err?.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: 'email' | 'password') =>
    `input-field${touched[field] && errors[field] ? ' border-red-500 focus:ring-red-500' : ''}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-smoke-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Factory size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-smoke-900">Welcome back</h1>
          <p className="text-smoke-600 mt-1">Sign in to your account.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                className={inputClass('email')}
                autoComplete="email"
              />
              {touched.email && errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`${inputClass('password')} pr-10`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-400 hover:text-smoke-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.password && errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-smoke-600 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
