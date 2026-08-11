import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart,
  MessageSquare,
  ArrowLeft,
  Factory,
  Tag,
} from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import toast from 'react-hot-toast';
import { PageLoader } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data),
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated || user?.role !== 'BUYER') {
      toast.error('Please login as a buyer');
      return;
    }
    try {
      const res = await api.post('/cart/add', {
        product_id: Number(id!),
        quantity: Number(1),
      });
      setCart(res.data.cart);
      toast.success('Added to cart');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const navigate = useNavigate();

  // const handleContactSeller = () => {
  //   if (!isAuthenticated) {
  //     toast.error('Please login to contact the seller');
  //     return;
  //   }

  //   const recipient = data?.product?.created_by_admin
  //     ? data.product.admin?.user
  //     : data?.product?.factory?.user;

  //   if (!recipient) {
  //     toast.error('Seller information not available');
  //     return;
  //   }

  //   navigate(
  //     `/messages?to=${recipient.user_id}&product_id=${product.product_id}&product_name=${encodeURIComponent(
  //       product.product_name
  //     )}`
  //   );
  // };

  if (isLoading) return <PageLoader />;
  if (!data?.product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">Product not found</p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">
          Back to Products
        </Link>
      </div>
    );

  const { product } = data;

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.error('Please login to contact the seller');
      return;
    }

    const recipient = product.created_by_admin
      ? product.admin?.user
      : product.factory?.user;

    if (!recipient) {
      toast.error('Seller information not available');
      return;
    }

    const query = new URLSearchParams();
    query.set('to', String(recipient.user_id));
    query.set('product_id', String(product.product_id));
    query.set('product_name', product.product_name);
    if (product.image) query.set('product_image', product.image);

    navigate(`/messages?${query.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link
          to="/products"
          className="hover:text-primary-600 flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Products
        </Link>
        <span>/</span>
        <span className="text-slate-700">{product.product_name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.product_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">📦</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="badge badge-blue">
              {product.category.category_name}
            </span>
            <StatusBadge status={product.availability_status} />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {product.product_name}
          </h1>

          {/* <div className="flex items-center gap-2 text-slate-500 mb-6">
            <Factory size={16} />
            <Link
              to={`/factories/${product.factory.factory_id}`}
              className="hover:text-primary-600 font-medium"
            >
              {product.factory.factory_name}
            </Link>
            <span>·</span>
            <span>{product.factory.location}</span>
          </div> */}

          <div className="flex items-center gap-2 text-slate-500 mb-6">
            <Factory size={16} />

            {product.factory ? (
              <>
                <Link
                  to={`/factories/${product.factory.factory_id}`}
                  className="hover:text-primary-600 font-medium"
                >
                  {product.factory.factory_name}
                </Link>

                <span>·</span>

                <span>{product.factory.location}</span>
              </>
            ) : product.admin ? (
              <>
                <span className="font-medium text-slate-700">
                  {product.admin.user?.full_name || 'Admin Seller'}
                </span>

                <span>·</span>

                <span>Admin</span>
              </>
            ) : (
              <span>Seller information unavailable</span>
            )}
          </div>
          <div className="text-4xl font-bold text-slate-900 mb-6">
            ETB {Number(product.price).toLocaleString()}
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
              <p className="text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs text-slate-500 mb-1">Stock Quantity</p>
              <p className="font-semibold text-slate-800">
                {product.stock_quantity} units
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Category</p>
              <p className="font-semibold text-slate-800">
                {product.category.category_name}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.availability_status !== 'AVAILABLE'}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
            <button
              onClick={handleContactSeller}
              className="btn-secondary flex items-center gap-2 px-5 py-3"
            >
              <MessageSquare size={18} />
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
