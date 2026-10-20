import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import api from '../../lib/api';
import { PageLoader } from '../../components/LoadingSpinner';
import { useCartStore } from '../../store/cartStore';
import { useTranslation } from 'react-i18next';

export default function PaymentResultPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const [state, setState] = useState<'loading' | 'success' | 'pending' | 'error'>('loading');
  const [orderId, setOrderId] = useState<number>();
  const txRef = params.get('tx_ref');
  const { clearCart } = useCartStore();

  useEffect(() => {
    if (!txRef) { setState('error'); return; }
    api.get(`/payments/verify/${encodeURIComponent(txRef)}`)
      .then(({ data }) => {
        if (data.success && data.order_id) {
          clearCart();
          setOrderId(data.order_id);
          setState('success');
        } else setState('pending');
      })
      .catch(() => setState('error'));
  }, [clearCart, txRef]);

  if (state === 'loading') return <PageLoader />;
  const successful = state === 'success';
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      {successful ? <CheckCircle2 className="mx-auto mb-4 text-green-600" size={52} /> : <XCircle className="mx-auto mb-4 text-amber-500" size={52} />}
      <h1 className="text-2xl font-bold text-slate-900">{successful ? t('paymentSuccessful') : state === 'pending' ? t('paymentPending') : t('paymentFailed')}</h1>
      <p className="mt-3 text-slate-600">{successful ? t('orderConfirmed') : t('cartNotTurned')}</p>
      <Link to={successful ? `/orders/${orderId}` : '/checkout'} className="btn-primary inline-flex mt-7">{successful ? t('viewOrder') : t('returnToCheckout')}</Link>
    </div>
  );
}
