import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export interface Product {
  product_id: number;
  product_name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  availability_status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  image: string | null;
  factory: { factory_name: string; location?: string };
  category: { category_name: string };
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { setCart } = useCartStore();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated || user?.role !== 'BUYER') {
      toast.error('Please login as a buyer to add items to cart');
      return;
    }
    try {
      const res = await api.post('/cart/add', { product_id: product.product_id, quantity: 1 });
      setCart(res.data.cart);
      toast.success('Added to cart');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  const isAvailable = product.availability_status === 'AVAILABLE';

  return (
    <Link to={`/products/${product.product_id}`} className="card group hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-slate-300 text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-xs text-slate-400">No image</p>
            </div>
          </div>
        )}
        {/* Availability badge */}
        <div className="absolute top-2 right-2">
          <span className={clsx('badge text-xs', isAvailable ? 'badge-green' : 'badge-red')}>
            {isAvailable ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-primary-600 font-medium mb-1">{product.category.category_name}</p>
        <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">
          {product.product_name}
        </h3>
        <p className="text-xs text-slate-500 mb-3 truncate">{product.factory.factory_name}</p>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">
            ETB {Number(product.price).toLocaleString()}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                isAvailable
                  ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              )}
              title="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
            <div className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
              <Eye size={16} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
