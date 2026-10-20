import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { useTranslation } from 'react-i18next';

export default function AdminProducts() {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    product_name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category_id: '',
    availability_status: 'AVAILABLE',
    factory_id: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => api.get('/products?limit=50').then((r) => r.data),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then((r) => r.data),
  });

  // const { data: factoriesData } = useQuery({
  //   queryKey: ['factories'],
  //   queryFn: () => api.get('/factories').then((r) => r.data),
  // });

  const adminProducts = productsData?.products?.filter(
    (product: any) => product.created_by_admin
  );
  const factoryProducts = productsData?.products?.filter(
    (product: any) => !product.created_by_admin
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);
      if (editId)
        return api.put(`/products/${editId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      return api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success(editId ? t('productUpdated') : t('productCreated'));
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setShowModal(false);
      setForm({
        product_name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category_id: '',
        availability_status: 'AVAILABLE',
        factory_id: '',
      });
      setEditId(null);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t('failedSave'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/products/${id}`),
    onSuccess: () => {
      toast.success(t('productDeleted'));
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    },
  });

  const openEdit = (product: any) => {
    setEditId(product.product_id);
    setForm({
      product_name: product.product_name,
      description: product.description || '',
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      category_id: String(product.category_id),
      availability_status: product.availability_status,
      factory_id: String(product.factory_id),
    });
    setShowModal(true);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('productManagement')}
        </h1>
        <button
          onClick={() => {
            setShowModal(true);
            setEditId(null);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> {t('addProduct')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('adminProducts')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('adminProductsDesc')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('productName')}
                  </th>
                  {/* <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    Factory
                  </th> */}
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('price')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('stock')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('status')}
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {adminProducts?.map((product: any) => (
                  <tr key={product.product_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              📦
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-800">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {product.category.category_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-slate-600">
                      {product.factory.factory_name}
                    </td> */}
                    <td className="px-6 py-4 font-semibold text-sm">
                      ETB {Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.stock_quantity}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.availability_status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t('deleteProductConfirm')))
                              deleteMutation.mutate(product.product_id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!adminProducts?.length && (
            <div className="text-center py-10 text-slate-400">
              {t('noAdminProducts')}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">
              {t('factoryProducts')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('factoryProductsDesc')}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('productName')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('factory')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('price')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('stock')}
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('status')}
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {factoryProducts?.map((product: any) => (
                  <tr key={product.product_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              📦
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-800">
                            {product.product_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {product.category.category_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.factory.factory_name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-sm">
                      ETB {Number(product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {product.stock_quantity}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.availability_status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(t('deleteProductConfirm')))
                              deleteMutation.mutate(product.product_id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!factoryProducts?.length && (
            <div className="text-center py-10 text-slate-400">
              No factory-created products available.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold">{editId ? t('editProduct') : t('addProduct')}</h2>
              <button onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* {!editId && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('factory')}
                  </label>
                  <select
                    value={form.factory_id}
                    onChange={(e) =>
                      setForm({ ...form, factory_id: e.target.value })
                    }
                    className="input-field"
                    required
                  >
                    <option value="">{t('selectFactory')}</option>
                    {factoriesData?.factories?.map(
                      (f: { factory_id: number; factory_name: string }) => (
                        <option key={f.factory_id} value={f.factory_id}>
                          {f.factory_name}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )} */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('productName')}
                </label>
                <input
                  value={form.product_name}
                  onChange={(e) =>
                    setForm({ ...form, product_name: e.target.value })
                  }
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('description')}
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="input-field h-20 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('price')} (ETB)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    {t('stock')}
                  </label>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) =>
                      setForm({ ...form, stock_quantity: e.target.value })
                    }
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('category')}
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value })
                  }
                  className="input-field"
                  required
                >
                  <option value="">{t('selectCategory')}</option>
                  {categoriesData?.categories?.map(
                    (cat: { category_id: number; category_name: string }) => (
                      <option key={cat.category_id} value={cat.category_id}>
                        {cat.category_name}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('productImage')}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="btn-primary flex-1"
              >
                {saveMutation.isPending
                  ? t('saving')
                  : editId
                    ? t('update')
                    : t('create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
