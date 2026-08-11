import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/LoadingSpinner';

export default function CartPage() {
  const { cart, setCart } = useCartStore();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
  });

  useEffect(() => {
    if (data?.cart) setCart(data.cart);
  }, [data, setCart]);

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const res = await api.put(`/cart/item/${itemId}`, { quantity });
      setCart(res.data.cart);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const res = await api.delete(`/cart/item/${itemId}`);
      setCart(res.data.cart);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  if (isLoading) return <PageLoader />;

  const cartData = data?.cart;
  const cartItems = cartData
    ? (cartData.cartItems ?? cartData.cartitem ?? [])
    : [];
  const isEmpty = cartItems.length === 0;

  if (isEmpty) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-8xl mb-6">🛒</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Your cart is empty
        </h2>
        <p className="text-slate-500 mb-8">Add some products to get started</p>
        <Link
          to="/products"
          className="btn-primary px-8 py-3 inline-flex items-center gap-2"
        >
          <ShoppingBag size={18} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(
            (item: {
              cart_item_id: number;
              quantity: number;
              subtotal: number;
              product: {
                product_id: number;
                product_name: string;
                price: number;
                image: string | null;
                factory: { factory_name: string };
                category: { category_name: string };
              };
            }) => (
              <div key={item.cart_item_id} className="card p-5 flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      📦
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product.product_id}`}
                    className="font-semibold text-slate-900 hover:text-primary-600 line-clamp-1"
                  >
                    {item.product.product_name}
                  </Link>
                  <p className="text-sm text-slate-500">
                    {item.product.factory?.factory_name || 'No Factory'}
                  </p>
                  <p className="text-sm font-medium text-primary-600 mt-1">
                    ETB {Number(item.product.price).toLocaleString()} each
                  </p>
                </div>

                {/* Quantity & Actions */}
                <div className="flex flex-col items-end gap-3">
                  <button
                    type="button"
                    onClick={() => removeItem(item.cart_item_id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.cart_item_id, item.quantity - 1)
                      }
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.cart_item_id, item.quantity + 1)
                      }
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="font-bold text-slate-900">
                    ETB {Number(item.subtotal).toLocaleString()}
                  </p>
                </div>
              </div>
            )
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-5">
              Order Summary
            </h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>
                  ETB {Number(cartData?.total_price ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span>ETB {Number(cartData.total_price).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <Link
              to="/products"
              className="btn-secondary w-full py-2.5 mt-3 text-center block text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
