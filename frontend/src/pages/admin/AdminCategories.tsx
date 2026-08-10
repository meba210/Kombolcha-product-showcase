import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/LoadingSpinner';

export default function AdminCategories() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ category_name: '', description: '' });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: () => editId
      ? api.put(`/categories/${editId}`, form)
      : api.post('/categories', form),
    onSuccess: () => {
      toast.success(editId ? 'Category updated' : 'Category created');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setShowModal(false);
      setForm({ category_name: '', description: '' });
      setEditId(null);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <button onClick={() => { setShowModal(true); setEditId(null); setForm({ category_name: '', description: '' }); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.categories?.map((cat: { category_id: number; category_name: string; description: string | null; _count: { products: number } }) => (
          <div key={cat.category_id} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-xl">
                {cat.category_name.includes('Textile') ? '🧵' : cat.category_name.includes('Steel') ? '⚙️' : cat.category_name.includes('Food') ? '🌾' : cat.category_name.includes('Construction') ? '🏗️' : '🏭'}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditId(cat.category_id); setForm({ category_name: cat.category_name, description: cat.description || '' }); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                  <Edit size={14} />
                </button>
                <button onClick={() => { if (confirm('Delete category?')) deleteMutation.mutate(cat.category_id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">{cat.category_name}</h3>
            <p className="text-xs text-slate-500 mb-2 line-clamp-2">{cat.description}</p>
            <p className="text-xs font-medium text-primary-600">{cat._count.products} products</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold">{editId ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Name</label>
                <input value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-20 resize-none" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-primary flex-1">
                {saveMutation.isPending ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
