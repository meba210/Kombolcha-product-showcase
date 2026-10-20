import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, MessageSquare, ArrowLeft, Factory, } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useTranslation } from 'react-i18next';

export default function ProductDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated || user?.role !== 'BUYER') {
<<<<<<< HEAD
      toast.error(t('detail_login_buyer'));
=======
      toast.error(t('loginAsBuyer'));
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
      return;
    }
    try {
      const res = await api.post('/cart/add', { product_id: Number(id!), quantity: 1 });
      setCart(res.data.cart);
<<<<<<< HEAD
      toast.success(t('card_added'));
=======
      toast.success(t('addedToCart'));
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t('failedAddToCart'));
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.error(t('detail_login_contact'));
      return;
    }
    const recipient = product.created_by_admin
      ? product.admin?.user
      : product.factory?.user;
    if (!recipient) {
      toast.error(t('detail_seller_unavailable'));
      return;
    }
    const query = new URLSearchParams();
    query.set('to', String(recipient.user_id));
    query.set('product_id', String(product.product_id));
    query.set('product_name', product.product_name);
    if (product.image) query.set('product_image', product.image);
    navigate(`/messages?${query.toString()}`);
  };

  if (isLoading) return <PageLoader />;
  if (!data?.product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
<<<<<<< HEAD
        <p className="text-slate-500">{t('detail_not_found')}</p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">
          {t('detail_back_to_products')}
=======
        <p className="text-slate-500">{t('productNotFound')}</p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">
          {t('backToProducts')}
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
        </Link>
      </div>
    );

  const { product } = data;

<<<<<<< HEAD
=======
  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.error(t('loginToContact'));
      return;
    }

    const recipient = product.created_by_admin
      ? product.admin?.user
      : product.factory?.user;

    if (!recipient) {
      toast.error(t('sellerNotAvailable'));
      return;
    }

    const query = new URLSearchParams();
    query.set('to', String(recipient.user_id));
    query.set('product_id', String(product.product_id));
    query.set('product_name', product.product_name);
    if (product.image) query.set('product_image', product.image);

    navigate(`/messages?${query.toString()}`);
  };

>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/products" className="hover:text-primary-600 flex items-center gap-1">
          <ArrowLeft size={14} /> {t('detail_back')}
        </Link>
        <span>/</span>
        <span className="text-slate-700">{product.product_name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.product_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">📦</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge badge-blue">{product.category.category_name}</span>
            <StatusBadge status={product.availability_status} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">{product.product_name}</h1>

          <div className="flex items-center gap-2 text-slate-500 mb-6">
            <Factory size={16} />
            {product.factory ? (
              <>
                <Link to={`/factories/${product.factory.factory_id}`} className="hover:text-primary-600 font-medium">
                  {product.factory.factory_name}
                </Link>
                <span>·</span>
                <span>{product.factory.location}</span>
              </>
            ) : product.admin ? (
              <>
                <span className="font-medium text-slate-700">
                  {product.admin.user?.full_name || t('detail_admin_seller')}
                </span>
                <span>·</span>
<<<<<<< HEAD
                <span>Admin</span>
              </>
            ) : (
              <span>{t('detail_seller_unavailable')}</span>
=======

                <span>{t('adminRole')}</span>
              </>
            ) : (
              <span>{t('sellerUnavailable')}</span>
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
            )}
          </div>

          <div className="text-4xl font-bold text-slate-900 mb-6">
            ETB {Number(product.price).toLocaleString()}
          </div>

          {product.description && (
            <div className="mb-6">
<<<<<<< HEAD
              <h3 className="font-semibold text-slate-800 mb-2">{t('detail_description')}</h3>
              <p className="text-slate-600 leading-relaxed">{product.description}</p>
=======
              <h3 className="font-semibold text-slate-800 mb-2">{t('description')}</h3>
              <p className="text-slate-600 leading-relaxed">
                {product.description}
              </p>
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-xl">
            <div>
<<<<<<< HEAD
              <p className="text-xs text-slate-500 mb-1">{t('detail_stock_qty')}</p>
              <p className="font-semibold text-slate-800">
                {product.stock_quantity} {t('detail_units')}
=======
              <p className="text-xs text-slate-500 mb-1">{t('stockQuantity')}</p>
              <p className="font-semibold text-slate-800">
                {product.stock_quantity} {t('units')}
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">{t('category')}</p>
<<<<<<< HEAD
              <p className="font-semibold text-slate-800">{product.category.category_name}</p>
=======
              <p className="font-semibold text-slate-800">
                {product.category.category_name}
              </p>
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.availability_status !== 'AVAILABLE'}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <ShoppingCart size={18} />
<<<<<<< HEAD
              {t('detail_add_to_cart')}
=======
              {t('addToCart')}
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
            </button>
            <button
              onClick={handleContactSeller}
              className="btn-secondary flex items-center gap-2 px-5 py-3"
            >
              <MessageSquare size={18} />
<<<<<<< HEAD
              {t('detail_contact_seller')}
=======
              {t('contactSeller')}
>>>>>>> a96d4d9bff01c20d9a2cb47f05bb707fa203cb91
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
