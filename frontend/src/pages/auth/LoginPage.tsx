import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../lib/api';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const [serverErrors, setServerErrors] = useState<FormErrors>({});

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  function validate(em: string, pw: string): FormErrors {
    const errs: FormErrors = {};
    if (!em.trim()) errs.email = t('login_err_email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.trim())) errs.email = t('login_err_email_invalid');
    if (!pw) errs.password = t('login_err_password_required');
    return errs;
  }

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(email, password));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (serverErrors.email) setServerErrors((prev) => ({ ...prev, email: undefined }));
    if (touched.email) setErrors(validate(e.target.value, password));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (serverErrors.password) setServerErrors((prev) => ({ ...prev, password: undefined }));
    if (touched.password) setErrors(validate(email, e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const status = err?.response?.status;
      const apiErrors: { field: string; message: string }[] = err?.response?.data?.errors;
      if (Array.isArray(apiErrors)) {
        const mapped: FormErrors = {};
        apiErrors.forEach((e) => {
          if (e.field === 'email') mapped.email = e.message;
          if (e.field === 'password') mapped.password = e.message;
        });
        setServerErrors(mapped);
        setTouched({ email: true, password: true });
      } else if (status === 401) {
        setServerErrors({
          email: t('login_err_email_wrong'),
          password: t('login_err_password_wrong'),
        });
        setTouched({ email: true, password: true });
      } else {
        toast.error(err?.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const getError = (field: 'email' | 'password') => serverErrors[field] || errors[field];
  const inputClass = (field: 'email' | 'password') =>
    `input-field${touched[field] && getError(field) ? ' border-red-500 focus:ring-red-500' : ''}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-smoke-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Factory size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-smoke-900">{t('login_title')}</h1>
          <p className="text-smoke-600 mt-1">{t('login_subtitle')}</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                {t('login_email_label')}
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                placeholder={t('login_email_placeholder')}
                className={inputClass('email')}
                autoComplete="email"
              />
              {touched.email && getError('email') && (
                <p className="mt-1 text-xs text-red-600">{getError('email')}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                {t('login_password_label')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  placeholder={t('login_password_placeholder')}
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
              {touched.password && getError('password') && (
                <p className="mt-1 text-xs text-red-600">{getError('password')}</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? t('login_submitting') : t('login_submit')}
            </button>
          </form>

          <p className="text-center text-sm text-smoke-600 mt-6">
            {t('login_no_account')}{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
              {t('login_register_link')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
