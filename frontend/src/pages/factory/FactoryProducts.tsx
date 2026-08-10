import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';

interface ProductForm {
  product_name: string;
  description: string;
  price: string;
  stock_quantity: string;
  category_id: string;
  availability_status: string;
}

const emptyForm: ProductForm = {
  product_name: '',
  description: '',
  price: '',
  stock_quantity: '',
  category_id: '',
  availability_status: 'AVAILABLE',
};

export default function FactoryProducts() {
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['factory-products'],
    queryFn: () => api.get('/products/factory/my').then((r) => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);

      if (editId) {
        return api.put(`/products/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      return api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      toast.success(editId ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['factory-products'] });
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      setImageFile(null);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to save product');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['factory-products'] });
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const openEdit = (product: {
    product_id: number;
    product_name: string;
    description: string | null;
    price: number;
    stock_quantity: number;
    category_id: number;
    availability_status: string;
  }) => {
    setEditId(product.product_id);
    setForm({
      product_name: product.product_name,
      description: product.description || '',
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      category_id: String(product.category_id),
      availability_status: product.availability_status,
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
        <button onClick={() => { setShowModal(true); setEditId(null); setForm(emptyForm); }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productsData?.products?.map((product: {
                product_id: number;
                product_name: string;
                description: string | null;
                price: number;
                stock_quantity: number;
                category_id: number;
                availability_status: string;
                image: string | null;
                category: { category_name: string };
              }) => (
                <tr key={product.product_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                        )}
                      </div>
                      <p className="font-medium text-slate-800 text-sm">{product.product_name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.category.category_name}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-800">ETB {Number(product.price).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{product.stock_quantity}</td>
                  <td className="px-6 py-4"><StatusBadge status={product.availability_status} /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(product.product_id); }}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productsData?.products?.length === 0 && (
            <div className="text-center py-12 text-slate-400">No products yet. Add your first product!</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Name</label>
                <input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-24 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (ETB)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Stock Quantity</label>
                  <input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field" required>
                  <option value="">Select category</option>
                  {categoriesData?.categories?.map((cat: { category_id: number; category_name: string }) => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Availability</label>
                <select value={form.availability_status} onChange={(e) => setForm({ ...form, availability_status: e.target.value })} className="input-field">
                  <option value="AVAILABLE">Available</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Product Image</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="input-field" />
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
