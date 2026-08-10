import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { User, Save } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone_number: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/profile', form);
      updateUser({ full_name: res.data.user.full_name });
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <User size={20} className="text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      </div>

      <div className="card p-8">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">{user?.full_name}</p>
            <p className="text-slate-500">{user?.email}</p>
            <span className="badge badge-blue mt-1 capitalize">{user?.role?.toLowerCase()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="input-field"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <input value={user?.email || ''} disabled className="input-field bg-slate-50 text-slate-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
            <input
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              className="input-field"
              placeholder="+251911000000"
            />
          </div>
          {user?.role === 'BUYER' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="input-field"
                placeholder="Your address"
              />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-6 py-2.5">
            <Save size={16} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
