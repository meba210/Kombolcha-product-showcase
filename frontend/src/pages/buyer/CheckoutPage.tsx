import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, ShoppingBag } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
  });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Starting Chapa stores only a payment attempt. The order, stock update,
      // and cart update happen after Chapa confirms a successful payment.
      const paymentRes = await api.post('/payments/initialize');
      const { checkout_url } = paymentRes.data;

      toast.success(t('redirectingPayment'));

      window.location.href = checkout_url;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || t('failedStartPayment'));
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <PageLoader />;

  const currentCart = cartData?.cart;
  const currentCartItems = currentCart
    ? (currentCart.cartItems ?? currentCart.cartitem ?? [])
    : [];
  if (!currentCart || currentCartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">{t('checkout')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Items */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {t('orderItems')}
          </h2>
          <div className="space-y-3">
            {currentCartItems.map(
              (item: {
                cart_item_id: number;
                quantity: number;
                subtotal: number;
                product: {
                  product_name: string;
                  price: number;
                  image: string | null;
                };
              }) => (
                <div
                  key={item.cart_item_id}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate">
                      {item.product.product_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t('qty')}: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-sm">
                    ETB {Number(item.subtotal).toLocaleString()}
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {t('paymentSummary')}
          </h2>
          <div className="card p-6">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{t('subtotal')}</span>
                <span>
                  ETB {Number(currentCart.total_price).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>{t('delivery')}</span>
                <span className="text-green-600">{t('free')}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-lg text-slate-900">
                <span>{t('total')}</span>
                <span>
                  ETB {Number(currentCart.total_price).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <CreditCard size={16} />
                <span className="font-medium text-sm">
                  {t('chapaGateway')}
                </span>
              </div>
              <p className="text-xs text-blue-600">
                {t('chapaDesc')}
              </p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base"
            >
              {loading ? (
                t('processing')
              ) : (
                <>
                  <ShoppingBag size={18} />
                  {t('placeOrder')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
