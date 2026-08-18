import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, AlertTriangle, X } from 'lucide-react';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/LoadingSpinner';

// ─── Remove-item confirmation panel (shown in the sidebar) ──────────────────

interface RemoveConfirmProps {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function RemoveConfirm({ productName, onConfirm, onCancel }: RemoveConfirmProps) {
  return (
    <div className="border border-red-200 bg-red-50 rounded-xl p-4 mb-4 animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle size={15} className="text-red-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800 mb-0.5">Remove item?</p>
          <p className="text-xs text-red-600 leading-snug line-clamp-2">
            "{productName}" will be removed from your cart.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-red-400 hover:text-red-600 transition-colors shrink-0 mt-0.5"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onConfirm}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          Yes, remove
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-white border border-smoke-200 text-smoke-700 hover:bg-smoke-50 text-xs font-semibold py-2 rounded-lg transition-colors"
        >
          Keep it
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CartPage() {
  const { cart, setCart } = useCartStore();
  const navigate = useNavigate();

  // Which item is pending removal — { id, name } or null
  const [pendingRemove, setPendingRemove] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading } = useQuery({
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

  const confirmRemove = async () => {
    if (!pendingRemove) return;
    try {
      const res = await api.delete(`/cart/item/${pendingRemove.id}`);
      setCart(res.data.cart);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setPendingRemove(null);
    }
  };

  if (isLoading) return <PageLoader />;

  const cartData = data?.cart;
  const cartItems = cartData ? (cartData.cartItems ?? cartData.cartitem ?? []) : [];
  const isEmpty = cartItems.length === 0;

  if (isEmpty) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-smoke-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={32} className="text-smoke-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Your cart is empty</h2>
        <p className="text-slate-500 mb-8">Add some products to get started</p>
        <Link to="/products" className="btn-primary px-8 py-3 inline-flex items-center gap-2">
          <ShoppingBag size={18} /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item: {
            cart_item_id: number;
            quantity: number;
            subtotal: number;
            product: {
              product_id: number;
              product_name: string;
              price: number;
              image: string | null;
              factory: { factory_name: string } | null;
              category: { category_name: string } | null;
            };
          }) => {
            const isPending = pendingRemove?.id === item.cart_item_id;
            return (
              <div
                key={item.cart_item_id}
                className={`card p-5 flex gap-4 transition-all duration-200 ${isPending ? 'border-red-200 bg-red-50/30' : ''}`}
              >
                {/* Image */}
                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={22} className="text-slate-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product.product_id}`}
                    className="font-semibold text-slate-900 hover:text-primary-600 line-clamp-1 transition-colors"
                  >
                    {item.product.product_name}
                  </Link>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {item.product.factory?.factory_name ?? 'Kombolcha Platform'}
                  </p>
                  <p className="text-sm font-medium text-primary-600 mt-1">
                    ETB {Number(item.product.price).toLocaleString()} / unit
                  </p>
                </div>

                {/* Quantity & remove */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {/* Trash — triggers sidebar alert, does NOT delete immediately */}
                  <button
                    type="button"
                    onClick={() =>
                      setPendingRemove(
                        isPending
                          ? null // toggle off if already selected
                          : { id: item.cart_item_id, name: item.product.product_name }
                      )
                    }
                    className={`transition-colors ${
                      isPending
                        ? 'text-red-500'
                        : 'text-slate-300 hover:text-red-400'
                    }`}
                    title="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Qty stepper */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <p className="font-bold text-slate-900 text-sm">
                    ETB {Number(item.subtotal).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Order Summary sidebar ── */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">

            {/* Remove confirmation alert — only shown when an item is selected */}
            {pendingRemove && (
              <RemoveConfirm
                productName={pendingRemove.name}
                onConfirm={confirmRemove}
                onCancel={() => setPendingRemove(null)}
              />
            )}

            <h2 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h2>

            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                <span>ETB {Number(cartData?.total_price ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span>ETB {Number(cartData?.total_price ?? 0).toLocaleString()}</span>
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
