import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import FactoryLocationPicker from '../../components/FactoryLocationPicker';

type Role = 'BUYER' | 'FACTORY';

interface FormState {
  full_name: string;
  email: string;
  password: string;
  phone_number: string;
  address: string;
  factory_name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  phone_number?: string;
  address?: string;
  factory_name?: string;
  location?: string;
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const [role, setRole] = useState<Role>('BUYER');
  const [form, setForm] = useState<FormState>({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    factory_name: '',
    location: '',
    latitude: null,
    longitude: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  function validateForm(f: FormState, r: Role): FormErrors {
    const errs: FormErrors = {};
    if (!f.full_name.trim())
      errs.full_name = t('fieldRequired', { field: t('fullName') });
    else if (f.full_name.trim().length < 2)
      errs.full_name = t('fieldMinLength', { field: t('fullName'), count: 2 });
    if (!f.email.trim()) errs.email = t('emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
      errs.email = t('invalidEmail');
    if (!f.password) errs.password = t('passwordRequired');
    else if (f.password.length < 6)
      errs.password = t('passwordMinLength', { count: 6 });
    else if (!/[A-Za-z]/.test(f.password))
      errs.password = t('passwordMustContainLetter');
    else if (!/[0-9]/.test(f.password))
      errs.password = t('passwordMustContainNumber');
    if (f.phone_number.trim() && !/^\+?[0-9\s\-]{7,20}$/.test(f.phone_number.trim()))
      errs.phone_number = t('phoneInvalid');
    if (r === 'FACTORY' && !f.factory_name.trim())
      errs.factory_name = t('fieldRequired', { field: t('factoryName') });
    return errs;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    if (touched[e.target.name as keyof FormState]) setErrors(validateForm(updated, role));
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateForm(form, role));
  };

  const handleRoleChange = (r: Role) => {
    setRole(r);
    if (Object.keys(touched).length > 0) setErrors(validateForm(form, r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allFields: (keyof FormState)[] = ['full_name', 'email', 'password', 'phone_number',
      ...(role === 'BUYER' ? ['address' as const] : ['factory_name' as const, 'location' as const])];
    setTouched(allFields.reduce((acc, f) => ({ ...acc, [f]: true }), {}));
    const errs = validateForm(form, role);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone_number.trim() || undefined,
        latitude: form.latitude ?? undefined,
        longitude: form.longitude ?? undefined,
        role,
        address: role === 'BUYER' ? form.address.trim() || undefined : undefined,
        factory_name:
          role === 'FACTORY' ? form.factory_name.trim() || undefined : undefined,
        location: role === 'FACTORY' ? form.location.trim() || undefined : undefined,
      };
      const response = await api.post('/auth/register', payload);
      const { token, user } = response.data;
      setAuth(user, token);
      toast.success(t('registrationSuccessful'));

      if (role === 'FACTORY') navigate('/factory/pending');
      else navigate('/buyer');
    } catch (error: any) {
      const serverErrors = error?.response?.data?.errors;
      if (Array.isArray(serverErrors)) {
        const mapped: FormErrors = {};
        serverErrors.forEach((e: { field: string; message: string }) => {
          if (e.field in form) mapped[e.field as keyof FormErrors] = e.message;
        });
        setErrors(mapped);
        setTouched(serverErrors.reduce((acc: any, e: any) => ({ ...acc, [e.field]: true }), {}));
      } else {
        toast.error(error?.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (field: keyof FormErrors) =>
    `input-field${touched[field] && errors[field] ? ' border-red-500 focus:ring-red-500' : ''}`;

  const Err = ({ field }: { field: keyof FormErrors }) =>
    touched[field] && errors[field]
      ? <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
      : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-smoke-50">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Factory size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-smoke-900">{t('createAccount')}</h1>
          <p className="text-smoke-600 mt-1">
            {t('joinKombolcha')}
          </p>
        </div>

        <div className="card p-8">
          {/* Role toggle */}
          <div className="flex gap-3 mb-6">
            {(['BUYER', 'FACTORY'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleChange(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  role === r
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-smoke-50 text-smoke-700 border-smoke-200 hover:border-primary-300'
                }`}
              >
                {r === 'BUYER' ? `🛒 ${t('buyerRole')}` : `🏭 ${t('factoryRole')}`}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  {t('fullName')}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  name="full_name" value={form.full_name} onChange={handleChange}
                  onBlur={() => handleBlur('full_name')}
                  placeholder={t('yourFullName')}
                  className={fieldClass('full_name')} autoComplete="name"
                />
                <Err field="full_name" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  {t('email')}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  name="email" type="email" value={form.email} onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder={t('emailPlaceholder')}
                  className={fieldClass('email')} autoComplete="email"
                />
                <Err field="email" />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  {t('phoneNumber')}
                </label>
                <input
                  name="phone_number" value={form.phone_number} onChange={handleChange}
                  onBlur={() => handleBlur('phone_number')}
                  placeholder={t('phonePlaceholder')}
                  className={fieldClass('phone_number')} autoComplete="tel"
                />
                <Err field="phone_number" />
              </div>

              {/* Password */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  {t('passwordLabel')} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    required
                    minLength={6}
                    placeholder={t('minPassword')}
                    className={`${fieldClass('password')} pr-10`}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-400 hover:text-smoke-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <Err field="password" />
                {form.password && !errors.password && (
                  <p className="mt-1 text-xs text-green-600">{t('passwordLooksGood')}</p>
                )}
              </div>

              {/* BUYER: Address */}
              {role === 'BUYER' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                    {t('address')}
                  </label>
                  <input
                    name="address" value={form.address} onChange={handleChange}
                    onBlur={() => handleBlur('address')}
                    placeholder={t('yourAddress')}
                    className={fieldClass('address')} autoComplete="street-address"
                  />
                  <Err field="address" />
                </div>
              )}

              {/* FACTORY: Factory Name + Location */}
              {role === 'FACTORY' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                      {t('factoryName')}
                      <span className="text-red-500"> *</span>
                    </label>
                    <input
                      name="factory_name" value={form.factory_name} onChange={handleChange}
                      onBlur={() => handleBlur('factory_name')}
                      placeholder={t('factoryNamePlaceholder')}
                      className={fieldClass('factory_name')}
                    />
                    <Err field="factory_name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                      {t('factoryLocation')}
                    </label>

                    <FactoryLocationPicker
                      latitude={form.latitude}
                      longitude={form.longitude}
                      onLocationSelect={(latitude, longitude, address) => {
                        setForm((prev) => ({
                          ...prev,
                          location: address,
                          latitude,
                          longitude,
                        }));
                      }}
                    />
                    <Err field="location" />
                  </div>
                </>
              )}
            </div>

            {role === 'FACTORY' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                {t('factoryApprovalWarning')}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? t('creatingAccount') : t('createAccount')}
            </button>
          </form>

          <p className="text-center text-sm text-smoke-600 mt-6">
            {t('alreadyHaveAccount')}{' '}
            <Link
              to="/login"
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              {t('signInLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
