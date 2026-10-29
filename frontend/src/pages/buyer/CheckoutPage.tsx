import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, MapPin, ShoppingBag, Truck } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { PageLoader } from '../../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [town, setTown] = useState('');
  const [address, setAddress] = useState('');

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then((r) => r.data),
  });

  const { data: deliveryTownsData, isLoading: townsLoading } = useQuery({
    queryKey: ['delivery-towns', cartData?.cart?.cart_id],
    queryFn: () => api.get('/delivery/towns').then((r) => r.data),
    enabled: Boolean(cartData?.cart),
  });

  const {
    data: quoteData,
    isLoading: quoteLoading,
    error: quoteError,
  } = useQuery({
    queryKey: ['delivery-quote', town, address],
    queryFn: () =>
      api.post('/delivery/quote', { town, address }).then((r) => r.data.quote),
    enabled: Boolean(town && address.trim()),
    retry: false,
  });

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Starting Chapa stores only a payment attempt. The order, stock update,
      // and cart update happen after Chapa confirms a successful payment.
      const paymentRes = await api.post('/payments/initialize', {
        town,
        address,
      });
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
  const availableTowns: string[] = deliveryTownsData?.towns ?? [];
  const quoteMessage = (quoteError as any)?.response?.data?.message;
  if (!currentCart || currentCartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const deliveryFeeByItem = new Map<number, number>();
  if (quoteData?.deliveries?.length) {
    const sellerFees = new Map<string, number>(
      quoteData.deliveries.map(
        (line: { seller_key: string; delivery_fee: number }) => [
          line.seller_key,
          Number(line.delivery_fee),
        ]
      )
    );
    const sellerSubtotals = new Map<string, number>();
    const itemsBySeller = new Map<string, typeof currentCartItems>();
    for (const item of currentCartItems) {
      const product = item.product;
      const sellerKey =
        product.created_by_admin || !product.factory_id
          ? 'platform'
          : `factory:${product.factory_id}`;
      const itemSubtotal = Number(product.price) * Number(item.quantity);
      sellerSubtotals.set(
        sellerKey,
        (sellerSubtotals.get(sellerKey) ?? 0) + itemSubtotal
      );
      itemsBySeller.set(sellerKey, [
        ...(itemsBySeller.get(sellerKey) ?? []),
        item,
      ]);
    }
    for (const [sellerKey, sellerItems] of itemsBySeller) {
      const sellerSubtotal = sellerSubtotals.get(sellerKey) ?? 0;
      const sellerFee =
        Math.round((sellerFees.get(sellerKey) ?? 0) * 100) / 100;
      let remainingFee = sellerFee;
      sellerItems.forEach(
        (
          item: {
            cart_item_id: number;
            quantity: number;
            product: { price: number };
          },
          index: number
        ) => {
          const itemSubtotal =
            Number(item.product.price) * Number(item.quantity);
          const share =
            index === sellerItems.length - 1
              ? remainingFee
              : Math.round(
                  (sellerSubtotal > 0
                    ? (sellerFee * itemSubtotal) / sellerSubtotal
                    : 0) * 100
                ) / 100;
          deliveryFeeByItem.set(item.cart_item_id, share);
          remainingFee = Math.round((remainingFee - share) * 100) / 100;
        }
      );
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">
        {t('checkout')}
      </h1>

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
                  product_id: number;
                  product_name: string;
                  price: number;
                  image: string | null;
                  factory_id: number | null;
                  created_by_admin: boolean;
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
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-sm">
                      ETB{' '}
                      {(
                        Number(item.product.price) * item.quantity
                      ).toLocaleString()}
                    </p>
                    {quoteData?.available ? (
                      <>
                        <p className="text-xs text-slate-500 mt-1">
                          {t('deliveryShare')}: ETB{' '}
                          {Number(
                            deliveryFeeByItem.get(item.cart_item_id) ?? 0
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                          {t('productWithDelivery')}: ETB{' '}
                          {(
                            Number(item.product.price) * item.quantity +
                            (deliveryFeeByItem.get(item.cart_item_id) ?? 0)
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1">
                        {t('deliveryCalculatedAtCheckout')}
                      </p>
                    )}
                  </div>
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
            <div className="space-y-4 mb-6">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="delivery-town"
                >
                  <MapPin size={14} className="inline mr-1" />{' '}
                  {t('deliveryTown')}
                </label>
                <select
                  id="delivery-town"
                  value={town}
                  onChange={(event) => setTown(event.target.value)}
                  className="input-field"
                  disabled={townsLoading || availableTowns.length === 0}
                >
                  <option value="">{t('selectDeliveryTown')}</option>
                  {availableTowns.map((availableTown) => (
                    <option key={availableTown} value={availableTown}>
                      {availableTown}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="delivery-address"
                >
                  {t('deliveryAddress')}
                </label>
                <textarea
                  id="delivery-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  className="input-field min-h-20 resize-y"
                  maxLength={500}
                  placeholder={t('enterDeliveryAddress')}
                  rows={3}
                />
              </div>
              {!townsLoading && availableTowns.length === 0 && (
                <p className="text-sm text-red-600">
                  {t('noDeliveryCoverage')}
                </p>
              )}
              {quoteLoading && (
                <p className="text-sm text-slate-500">
                  {t('calculatingDelivery')}
                </p>
              )}
              {quoteMessage && town && address.trim() && (
                <p className="text-sm text-red-600">
                  {t('deliveryUnavailable')}
                </p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>{t('subtotal')}</span>
                <span>
                  ETB{' '}
                  {Number(
                    quoteData?.subtotal ?? currentCart.total_price
                  ).toLocaleString()}
                </span>
              </div>
              {quoteData?.deliveries?.map(
                (delivery: {
                  seller_key: string;
                  seller_name: string;
                  provider_type: string;
                  delivery_fee: number;
                }) => (
                  <div
                    key={delivery.seller_key}
                    className="flex justify-between gap-3 text-sm text-slate-600"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-700">
                        {t('delivery')} · {delivery.seller_name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Truck size={12} />{' '}
                        {t(
                          delivery.provider_type === 'FACTORY'
                            ? 'factoryDelivery'
                            : 'platformDelivery'
                        )}
                      </span>
                    </span>
                    <span className="shrink-0">
                      ETB {Number(delivery.delivery_fee).toLocaleString()}
                    </span>
                  </div>
                )
              )}
              <div className="flex justify-between text-sm text-slate-600">
                <span>{t('totalDelivery')}</span>
                <span>
                  ETB {Number(quoteData?.delivery_fee ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-lg text-slate-900">
                <span>{t('total')}</span>
                <span>
                  ETB{' '}
                  {Number(
                    quoteData?.total ?? currentCart.total_price
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <CreditCard size={16} />
                <span className="font-medium text-sm">{t('chapaGateway')}</span>
              </div>
              <p className="text-xs text-blue-600">{t('chapaDesc')}</p>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || quoteLoading || !quoteData?.available}
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
