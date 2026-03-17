import type { StoreRecord } from "../data/stores";
import type { Product } from "../data/products";
import { getStoreStock } from "../data/products";
import { haversineDistanceKm, type CustomerLocation } from "./geo";

export type CartItem = {
  product: Product;
  quantity: number;
};

export type StoreWithDistance = StoreRecord & {
  distanceKm: number;
};

export type PackageItem = CartItem & {
  availableQty: number;
  fulfilledQty: number;
};

export type StorePackage = {
  store: StoreWithDistance;
  items: PackageItem[];
  deliveryModes: {
    rapida: {
      estimatedMinutes: number;
      shippingCost: number;
    };
    programada: {
      availableDates: ScheduleDate[];
      shippingCost: number;
    };
  };
};

export type OtherStorePackage = {
  store: StoreWithDistance;
  items: PackageItem[];
  deliveryModes: {
    programada: {
      availableDates: ScheduleDate[];
      shippingCost: number;
    };
  };
};

export type CDPackage = {
  items: PackageItem[];
  transitDaysToStore: number;
  lastMileMinutes: number;
  lastMileStore: StoreWithDistance;
  availableDates: ScheduleDate[];
  shippingCost: number;
};

export type ScheduleDate = {
  date: string;
  label: string;
  dayOfWeek: string;
  slots: string[];
};

export type FullOrderPackage = {
  items: PackageItem[];
  availableDates: ScheduleDate[];
  shippingCost: number;
  lastMileStore: StoreWithDistance;
};

export type DeliveryPlan = {
  nearestStore: StoreWithDistance;
  storePackage: StorePackage | null;
  otherStorePackages: OtherStorePackage[];
  cdPackage: CDPackage | null;
  fullOrderPackage: FullOrderPackage;
  allAvailableAtStore: boolean;
};

function rankStoresByDistance(
  customer: CustomerLocation,
  stores: StoreRecord[]
): StoreWithDistance[] {
  return stores
    .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
    .map((s) => ({
      ...s,
      distanceKm: haversineDistanceKm(customer.lat, customer.lng, s.lat!, s.lng!),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

const MOTO_COST_TABLE: Record<number, number> = {
  1: 5.99, 2: 6.49, 3: 6.99, 4: 7.99, 5: 8.99,
  6: 9.99, 7: 11.49, 8: 12.99, 9: 14.99, 10: 15.99,
  11: 17.49, 12: 18.99, 13: 20.49, 14: 21.99, 15: 23.49,
  16: 24.99, 17: 26.49, 18: 27.99, 19: 29.49, 20: 30.99,
};

function calcShippingCost(distanceKm: number): number {
  const km = Math.max(1, Math.ceil(distanceKm));
  if (km <= 20) return MOTO_COST_TABLE[km];
  return Number((30.99 + (km - 20) * 1.5).toFixed(2));
}

function calcDeliveryMinutes(distanceKm: number): number {
  const picking = Math.max(10, Math.min(30, Math.round(10 + distanceKm * 0.8)));
  const delivery = Math.max(10, Math.round(distanceKm * 3.5));
  return picking + delivery;
}

function generateScheduleDates(minDays: number, count: number): ScheduleDate[] {
  const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const SLOTS = ["08:00–12:00", "12:00–18:00", "18:00–21:00"];

  const now = new Date();
  const dates: ScheduleDate[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + minDays + i);

    const dayOfWeek = WEEKDAYS[d.getDay()];
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");

    dates.push({
      date: `${d.getFullYear()}-${mm}-${dd}`,
      label: `${dd}/${mm}`,
      dayOfWeek,
      slots: SLOTS,
    });
  }
  return dates;
}

const MAX_OTHER_STORE_DISTANCE_KM = 50;
const MAX_OTHER_STORES_TO_CHECK = 30;

type PendingItem = {
  product: Product;
  remainingQty: number;
};

function findItemsAtOtherStores(
  pendingItems: PendingItem[],
  ranked: StoreWithDistance[],
  nearestCode: string
): { fulfilled: Map<string, { store: StoreWithDistance; items: PackageItem[] }>; unfulfilled: PackageItem[] } {
  const fulfilled = new Map<string, { store: StoreWithDistance; items: PackageItem[] }>();
  const remaining = pendingItems.map((p) => ({ ...p }));

  const candidates = ranked
    .filter((s) => s.code !== nearestCode && s.distanceKm <= MAX_OTHER_STORE_DISTANCE_KM)
    .slice(0, MAX_OTHER_STORES_TO_CHECK);

  for (const store of candidates) {
    const allFulfilled = remaining.every((r) => r.remainingQty <= 0);
    if (allFulfilled) break;

    const itemsFromThisStore: PackageItem[] = [];

    for (const item of remaining) {
      if (item.remainingQty <= 0) continue;

      const stock = getStoreStock(store.code, item.product.id);
      if (stock <= 0) continue;

      const qty = Math.min(stock, item.remainingQty);
      itemsFromThisStore.push({
        product: item.product,
        quantity: qty,
        availableQty: stock,
        fulfilledQty: qty,
      });
      item.remainingQty -= qty;
    }

    if (itemsFromThisStore.length > 0) {
      fulfilled.set(store.code, { store, items: itemsFromThisStore });
    }
  }

  const unfulfilled: PackageItem[] = remaining
    .filter((r) => r.remainingQty > 0)
    .map((r) => ({
      product: r.product,
      quantity: r.remainingQty,
      availableQty: 0,
      fulfilledQty: r.remainingQty,
    }));

  return { fulfilled, unfulfilled };
}

/**
 * Motor de entrega v3.
 *
 * Fluxo:
 * 1. Encontra filial mais próxima e verifica estoque
 * 2. Itens disponíveis -> Pacote Filial (Rápida ou Programada)
 * 3. Itens indisponíveis -> busca em outras filiais próximas (até 50km)
 *    - Se outra filial tem -> Pacote Outra Filial (só Programada, com frete da distância)
 * 4. Itens que nenhuma filial tem -> Pacote CD (Programada, 3 dias)
 * 5. Opção de pedido completo sempre disponível
 */
export function calculateDeliveryPlan(
  customer: CustomerLocation,
  stores: StoreRecord[],
  cart: CartItem[]
): DeliveryPlan {
  const ranked = rankStoresByDistance(customer, stores);
  if (ranked.length === 0) throw new Error("Nenhuma loja geocodificada disponível");

  const nearest = ranked[0];

  const storeItems: PackageItem[] = [];
  const pendingItems: PendingItem[] = [];

  for (const item of cart) {
    const stock = getStoreStock(nearest.code, item.product.id);

    if (stock >= item.quantity) {
      storeItems.push({
        ...item,
        availableQty: stock,
        fulfilledQty: item.quantity,
      });
    } else if (stock > 0) {
      storeItems.push({
        ...item,
        availableQty: stock,
        fulfilledQty: stock,
      });
      pendingItems.push({
        product: item.product,
        remainingQty: item.quantity - stock,
      });
    } else {
      pendingItems.push({
        product: item.product,
        remainingQty: item.quantity,
      });
    }
  }

  const allMissingItems: PackageItem[] = pendingItems.map((p) => ({
    product: p.product,
    quantity: p.remainingQty,
    availableQty: 0,
    fulfilledQty: p.remainingQty,
  }));

  const { fulfilled: otherStoresMap } =
    pendingItems.length > 0
      ? findItemsAtOtherStores(pendingItems, ranked, nearest.code)
      : { fulfilled: new Map() };

  const deliveryMinutes = calcDeliveryMinutes(nearest.distanceKm);
  const motoboyShipping = calcShippingCost(nearest.distanceKm);

  const storePackage: StorePackage | null =
    storeItems.length > 0
      ? {
          store: nearest,
          items: storeItems,
          deliveryModes: {
            rapida: {
              estimatedMinutes: Math.min(deliveryMinutes, 120),
              shippingCost: motoboyShipping,
            },
            programada: {
              availableDates: generateScheduleDates(1, 7),
              shippingCost: motoboyShipping,
            },
          },
        }
      : null;

  const otherStorePackages: OtherStorePackage[] = [];
  const otherStoreFulfillsAll = otherStoresMap.size > 0;

  if (otherStoreFulfillsAll) {
    const allOtherItems: PackageItem[] = [];
    let bestStore: StoreWithDistance | null = null;

    for (const [, { store, items }] of otherStoresMap) {
      if (!bestStore) bestStore = store;
      allOtherItems.push(...items);
    }

    if (bestStore && allOtherItems.length > 0) {
      const storeShipping = calcShippingCost(bestStore.distanceKm);
      const transitDays = bestStore.distanceKm > 15 ? 2 : 1;
      otherStorePackages.push({
        store: bestStore,
        items: allMissingItems,
        deliveryModes: {
          programada: {
            availableDates: generateScheduleDates(transitDays, 5),
            shippingCost: storeShipping,
          },
        },
      });
    }
  }

  const cdPackage: CDPackage | null =
    allMissingItems.length > 0
      ? {
          items: allMissingItems,
          transitDaysToStore: 3,
          lastMileMinutes: deliveryMinutes,
          lastMileStore: nearest,
          availableDates: generateScheduleDates(3, 5),
          shippingCost: motoboyShipping,
        }
      : null;

  const allItems: PackageItem[] = cart.map((item) => ({
    ...item,
    availableQty: getStoreStock(nearest.code, item.product.id),
    fulfilledQty: item.quantity,
  }));

  const fullOrderPackage: FullOrderPackage = {
    items: allItems,
    availableDates: generateScheduleDates(3, 5),
    shippingCost: motoboyShipping,
    lastMileStore: nearest,
  };

  const hasExternalItems = allMissingItems.length > 0;

  return {
    nearestStore: nearest,
    storePackage,
    otherStorePackages,
    cdPackage,
    fullOrderPackage,
    allAvailableAtStore: !hasExternalItems,
  };
}
