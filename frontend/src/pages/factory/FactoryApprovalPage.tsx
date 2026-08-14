import { Clock3, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function FactoryApprovalPage() {
  const { user, logout } = useAuthStore();
  const rejected = user?.approval_status === 'REJECTED';

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      {rejected ? <XCircle size={52} className="mx-auto mb-4 text-red-500" /> : <Clock3 size={52} className="mx-auto mb-4 text-yellow-500" />}
      <h1 className="text-2xl font-bold text-slate-900">{rejected ? 'Factory registration rejected' : 'Factory approval pending'}</h1>
      <p className="mt-3 text-slate-600">{rejected ? 'Your factory account has not been approved. Please contact an administrator for more information.' : 'An administrator must approve your factory before you can access the factory dashboard.'}</p>
      <div className="mt-7 flex justify-center gap-3">
        <Link to="/" className="btn-secondary">Back to home</Link>
        <button onClick={logout} className="btn-primary">Sign out</button>
      </div>
    </div>
  );
}
