import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Factory, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import FactoryLocationPicker from '../../components/FactoryLocationPicker';

type Role = 'BUYER' | 'FACTORY';

export default function RegisterPage() {
  const [role, setRole] = useState<Role>('BUYER');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    factory_name: '',
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number || undefined,
        latitude:form.latitude || undefined,
        longitude:form.longitude || undefined,
        role,
        address: role === 'BUYER' ? form.address || undefined : undefined,
        factory_name:
          role === 'FACTORY' ? form.factory_name || undefined : undefined,
        location: role === 'FACTORY' ? form.location || undefined : undefined,
      };

      const response = await api.post('/auth/register', payload);
      const { token, user } = response.data;

      setAuth(user, token);
      toast.success('Registration successful!');

      if (role === 'FACTORY') navigate('/factory/pending');
      else navigate('/buyer');
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-smoke-50">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Factory size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-smoke-900">
            Create an account
          </h1>
          <p className="text-smoke-600 mt-1">
            Join the Kombolcha Showcase in your buyer or factory role.
          </p>
        </div>

        <div className="card p-8">
          <div className="flex gap-3 mb-6">
            {(['BUYER', 'FACTORY'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  role === r
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-smoke-50 text-smoke-700 border-smoke-200 hover:border-primary-300'
                }`}
              >
                {r === 'BUYER' ? '🛒 Buyer' : '🏭 Factory'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  Full Name
                </label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Abebe Kebede"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  Phone Number
                </label>
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="+251911000000"
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    placeholder="Min. 6 characters"
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke-400"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {role === 'BUYER' && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                    Address
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Addis Ababa, Ethiopia"
                    className="input-field"
                  />
                </div>
              )}

              {role === 'FACTORY' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                      Factory Name
                    </label>
                    <input
                      name="factory_name"
                      value={form.factory_name}
                      onChange={handleChange}
                      required
                      placeholder="My Factory Name"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-smoke-700 mb-1.5">
                      Factory Location
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
                  </div>
                </>
              )}
            </div>

            {role === 'FACTORY' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                ⚠️ Factory accounts require admin approval before you can list
                products.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-smoke-600 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
