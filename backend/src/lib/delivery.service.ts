import prisma from './prisma';

export interface DeliveryQuoteLine {
  seller_key: string;
  factory_id: number | null;
  provider_type: 'PLATFORM' | 'FACTORY';
  seller_name: string;
  town: string;
  address: string;
  delivery_fee: number;
}

interface DeliverySellerGroup {
  seller_key: string;
  provider_key: string;
  factory_id: number | null;
  provider_type: 'PLATFORM' | 'FACTORY';
  seller_name: string;
}

export const getBuyerCartItems = async (userId: number) => {
  const buyer = await prisma.buyer.findUnique({ where: { user_id: userId } });
  if (!buyer) throw new Error('BUYER_NOT_FOUND');

  const cart = await prisma.cart.findFirst({
    where: { buyer_id: buyer.buyer_id },
    include: {
      cartitem: {
        include: {
          product: {
            include: {
              factory: {
                select: {
                  factory_id: true,
                  factory_name: true,
                  uses_own_delivery: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { created_date: 'desc' },
  });

  if (!cart || cart.cartitem.length === 0) throw new Error('CART_EMPTY');
  return cart.cartitem;
};

const getSellerGroups = (items: any[]): DeliverySellerGroup[] => {
  const groups = new Map<string, DeliverySellerGroup>();

  for (const item of items) {
    const product = item.product;
    const factory = product.created_by_admin ? null : product.factory;
    const factoryId = factory?.factory_id ?? null;
    const sellerKey = factoryId === null ? 'platform' : `factory:${factoryId}`;
    const usesOwnDelivery = factoryId !== null && factory.uses_own_delivery;

    if (!groups.has(sellerKey)) {
      groups.set(sellerKey, {
        seller_key: sellerKey,
        provider_key: usesOwnDelivery ? sellerKey : 'platform',
        factory_id: factoryId,
        provider_type: usesOwnDelivery ? 'FACTORY' : 'PLATFORM',
        seller_name: factory?.factory_name ?? 'Platform products',
      });
    }
  }

  return Array.from(groups.values());
};

export const getDeliveryQuote = async (
  items: any[],
  town: string,
  address: string
) => {
  const groups = getSellerGroups(items);
  const zones = await prisma.deliveryzone.findMany({
    where: {
      provider_key: {
        in: [...new Set(groups.map((group) => group.provider_key))],
      },
      town,
      is_active: true,
    },
  });
  const zoneByProvider = new Map(
    zones.map((zone) => [zone.provider_key, zone])
  );
  const missing: string[] = [];
  const deliveries: DeliveryQuoteLine[] = [];

  for (const group of groups) {
    const zone = zoneByProvider.get(group.provider_key);
    if (!zone) {
      missing.push(group.seller_name);
      continue;
    }

    deliveries.push({
      seller_key: group.seller_key,
      factory_id: group.factory_id,
      provider_type: group.provider_type,
      seller_name: group.seller_name,
      town,
      address,
      delivery_fee: Number(zone.fee),
    });
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.product.price) * Number(item.quantity),
    0
  );
  const deliveryFee = deliveries.reduce(
    (sum, line) => sum + line.delivery_fee,
    0
  );

  return {
    available: missing.length === 0,
    town,
    deliveries,
    missing_sellers: missing,
    subtotal,
    delivery_fee: deliveryFee,
    total: subtotal + deliveryFee,
  };
};

export const getAvailableDeliveryTowns = async (items: any[]) => {
  const groups = getSellerGroups(items);
  const providerKeys = [...new Set(groups.map((group) => group.provider_key))];
  const zones = await prisma.deliveryzone.findMany({
    where: { provider_key: { in: providerKeys }, is_active: true },
    select: { provider_key: true, town: true },
    orderBy: { town: 'asc' },
  });

  let available: Set<string> | null = null;
  for (const key of providerKeys) {
    const towns = new Set(
      zones.filter((zone) => zone.provider_key === key).map((zone) => zone.town)
    );
    if (available === null) {
      available = towns;
    } else {
      const currentTowns: Set<string> = available;
      available = new Set<string>(
        Array.from(currentTowns).filter((town: string) => towns.has(town))
      );
    }
  }

  return [...(available ?? [])].sort((a, b) => a.localeCompare(b));
};
