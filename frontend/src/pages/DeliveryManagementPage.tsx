import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, MapPin, Plus, Trash2, Truck } from 'lucide-react';
import api from '../lib/api';
import { PageLoader } from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface DeliveryManagementPageProps {
  role: 'ADMIN' | 'FACTORY';
}

const deliveryStatuses = [
  'PENDING',
  'ASSIGNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'FAILED',
];

export default function DeliveryManagementPage({
  role,
}: DeliveryManagementPageProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isAdmin = role === 'ADMIN';
  const [town, setTown] = useState('');
  const [fee, setFee] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');

  const settingsQuery = useQuery({
    queryKey: ['delivery-settings', role],
    queryFn: () =>
      api.get('/delivery/settings').then((response) => response.data),
  });
  const ordersQuery = useQuery({
    queryKey: ['delivery-orders', role],
    queryFn: () =>
      api.get('/delivery/orders').then((response) => response.data),
  });

  const refreshDelivery = () => {
    queryClient.invalidateQueries({ queryKey: ['delivery-settings'] });
    queryClient.invalidateQueries({ queryKey: ['delivery-orders'] });
  };

  const saveZoneMutation = useMutation({
    mutationFn: () => api.post('/delivery/zones', { town, fee: Number(fee) }),
    onSuccess: () => {
      toast.success(t('deliveryZoneSaved'));
      setTown('');
      setFee('');
      refreshDelivery();
      queryClient.invalidateQueries({ queryKey: ['delivery-towns'] });
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || t('deliverySaveFailed')),
  });
  const deleteZoneMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/delivery/zones/${id}`),
    onSuccess: () => {
      toast.success(t('deliveryZoneRemoved'));
      refreshDelivery();
      queryClient.invalidateQueries({ queryKey: ['delivery-towns'] });
    },
    onError: () => toast.error(t('deliverySaveFailed')),
  });
  const preferenceMutation = useMutation({
    mutationFn: (usesOwn: boolean) =>
      api.put('/delivery/settings', { uses_own_delivery: usesOwn }),
    onSuccess: () => {
      toast.success(t('deliverySettingsSaved'));
      refreshDelivery();
    },
    onError: () => toast.error(t('deliverySaveFailed')),
  });
  const saveDriverMutation = useMutation({
    mutationFn: () =>
      api.post('/delivery/drivers', {
        full_name: driverName,
        phone_number: driverPhone,
      }),
    onSuccess: () => {
      toast.success(t('deliveryDriverSaved'));
      setDriverName('');
      setDriverPhone('');
      refreshDelivery();
    },
    onError: () => toast.error(t('deliverySaveFailed')),
  });
  const deactivateDriverMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/delivery/drivers/${id}`),
    onSuccess: refreshDelivery,
    onError: () => toast.error(t('deliverySaveFailed')),
  });
  const assignDriverMutation = useMutation({
    mutationFn: ({ id, driverId }: { id: number; driverId: number | null }) =>
      api.put(`/delivery/orders/${id}/driver`, { driver_id: driverId }),
    onSuccess: refreshDelivery,
    onError: () => toast.error(t('deliverySaveFailed')),
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/delivery/orders/${id}/status`, { status }),
    onSuccess: refreshDelivery,
    onError: () => toast.error(t('deliverySaveFailed')),
  });

  if (settingsQuery.isLoading || ordersQuery.isLoading) return <PageLoader />;

  const zones = settingsQuery.data?.zones ?? [];
  const drivers = settingsQuery.data?.drivers ?? [];
  const deliveries = ordersQuery.data?.deliveries ?? [];
  const usesOwnDelivery = Boolean(
    settingsQuery.data?.settings?.uses_own_delivery
  );

  const handleZoneSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (
      !town.trim() ||
      !fee ||
      !Number.isFinite(Number(fee)) ||
      Number(fee) < 0
    )
      return;
    saveZoneMutation.mutate();
  };
  const handleDriverSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!driverName.trim()) return;
    saveDriverMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {t('deliveryManagement')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t('deliveryManagementDesc')}
        </p>
      </div>

      {!isAdmin && (
        <section className="card p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              {t('factoryDeliveryPreference')}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {t('factoryDeliveryPreferenceDesc')}
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={usesOwnDelivery}
              onChange={(event) =>
                preferenceMutation.mutate(event.target.checked)
              }
              disabled={preferenceMutation.isPending}
              className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            {t('useOwnDelivery')}
          </label>
        </section>
      )}

      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={18} className="text-primary-600" />
          <h2 className="font-semibold text-slate-900">{t('deliveryZones')}</h2>
        </div>
        <form
          onSubmit={handleZoneSubmit}
          className="grid grid-cols-1 sm:grid-cols-[1fr_180px_auto] gap-3 mb-5"
        >
          <input
            value={town}
            onChange={(event) => setTown(event.target.value)}
            className="input-field"
            maxLength={100}
            placeholder={t('deliveryTown')}
            required
          />
          <input
            type="number"
            value={fee}
            onChange={(event) => setFee(event.target.value)}
            className="input-field"
            min="0"
            max="1000000"
            step="0.01"
            placeholder={t('deliveryFeeEtb')}
            required
          />
          <button
            type="submit"
            disabled={saveZoneMutation.isPending}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus size={16} /> {t('addDeliveryZone')}
          </button>
        </form>
        {zones.length === 0 ? (
          <p className="text-sm text-slate-500">{t('noDeliveryZones')}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {zones.map((zone: any) => (
              <div
                key={zone.delivery_zone_id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium text-slate-800">{zone.town}</p>
                  {isAdmin && (
                    <p className="text-xs text-slate-500">
                      {zone.provider_type === 'FACTORY'
                        ? zone.factory?.factory_name
                        : t('platformDelivery')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-800">
                    ETB {Number(zone.fee).toLocaleString()}
                  </span>
                  <span
                    className={`text-xs ${zone.is_active ? 'text-green-700' : 'text-slate-400'}`}
                  >
                    {zone.is_active ? t('active') : t('inactive')}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      deleteZoneMutation.mutate(zone.delivery_zone_id)
                    }
                    disabled={deleteZoneMutation.isPending}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title={t('removeDeliveryZone')}
                    aria-label={t('removeDeliveryZone')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isAdmin && (
        <section className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={18} className="text-primary-600" />
            <h2 className="font-semibold text-slate-900">
              {t('deliveryDrivers')}
            </h2>
          </div>
          <form
            onSubmit={handleDriverSubmit}
            className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mb-5"
          >
            <input
              value={driverName}
              onChange={(event) => setDriverName(event.target.value)}
              className="input-field"
              maxLength={120}
              placeholder={t('driverName')}
              required
            />
            <input
              value={driverPhone}
              onChange={(event) => setDriverPhone(event.target.value)}
              className="input-field"
              maxLength={40}
              placeholder={t('phoneNumber')}
            />
            <button
              type="submit"
              disabled={saveDriverMutation.isPending}
              className="btn-primary inline-flex items-center justify-center gap-2"
            >
              <Plus size={16} /> {t('addDriver')}
            </button>
          </form>
          <div className="divide-y divide-slate-100">
            {drivers.map((driver: any) => (
              <div
                key={driver.delivery_driver_id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {driver.full_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {driver.phone_number || '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    deactivateDriverMutation.mutate(driver.delivery_driver_id)
                  }
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title={t('deactivateDriver')}
                  aria-label={t('deactivateDriver')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {drivers.length === 0 && (
              <p className="text-sm text-slate-500 py-2">
                {t('noDeliveryDrivers')}
              </p>
            )}
          </div>
        </section>
      )}

      <section className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2">
          <Truck size={18} className="text-primary-600" />
          <h2 className="font-semibold text-slate-900">
            {t('deliveryTracking')}
          </h2>
        </div>
        {deliveries.length === 0 ? (
          <p className="text-sm text-slate-500 p-5">{t('noDeliveries')}</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {deliveries.map((delivery: any) => (
              <div
                key={delivery.order_delivery_id}
                className="p-5 grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-4 items-center"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">
                      {t('orderNumber', { id: delivery.order.order_id })}
                    </span>
                    <StatusBadge status={delivery.status} />
                    <span className="text-xs text-slate-500">
                      {delivery.tracking_code}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">
                    {delivery.seller_name} · {delivery.town} · ETB{' '}
                    {Number(delivery.delivery_fee).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {delivery.address} · {delivery.order.buyer.user.full_name}
                  </p>
                  {delivery.driver && (
                    <p className="text-xs text-slate-500 mt-1">
                      {delivery.driver.full_name} ·{' '}
                      {delivery.driver.phone_number}
                    </p>
                  )}
                </div>
                <select
                  value={delivery.status}
                  onChange={(event) =>
                    updateStatusMutation.mutate({
                      id: delivery.order_delivery_id,
                      status: event.target.value,
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                  className="input-field py-1.5 text-sm w-full lg:w-40"
                  aria-label={t('deliveryStatus')}
                >
                  {deliveryStatuses.map((status) => (
                    <option key={status} value={status}>
                      {t(status.toLowerCase())}
                    </option>
                  ))}
                </select>
                {isAdmin && delivery.provider_type === 'PLATFORM' && (
                  <select
                    value={delivery.driver_id ?? ''}
                    onChange={(event) =>
                      assignDriverMutation.mutate({
                        id: delivery.order_delivery_id,
                        driverId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      })
                    }
                    disabled={assignDriverMutation.isPending}
                    className="input-field py-1.5 text-sm w-full lg:w-48"
                    aria-label={t('assignDriver')}
                  >
                    <option value="">{t('unassigned')}</option>
                    {drivers.map((driver: any) => (
                      <option
                        key={driver.delivery_driver_id}
                        value={driver.delivery_driver_id}
                      >
                        {driver.full_name}
                      </option>
                    ))}
                  </select>
                )}
                {!isAdmin && delivery.status === 'DELIVERED' && (
                  <Check
                    size={18}
                    className="text-green-600"
                    aria-label={t('delivered')}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
