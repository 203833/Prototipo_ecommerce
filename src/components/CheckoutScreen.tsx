import { useState } from "react";
import {
  MapPin,
  Search,
  Truck,
  Clock,
  Package,
  Zap,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  CalendarDays,
  Trash2,
  Info,
  Store,
  PackageCheck,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import SJHeader from "./SJHeader";
import { ALL_STORES } from "../data/stores";
import { formatCEP, fetchAddressByCEP } from "../lib/geo";
import {
  calculateDeliveryPlan,
  type DeliveryPlan,
  type StorePackage,
  type OtherStorePackage,
  type CDPackage,
  type FullOrderPackage,
  type PackageItem,
  type ScheduleDate,
} from "../lib/delivery";

type StoreDeliveryMode = "rapida" | "programada";
type RemainingSource = "otherStore" | "cd";

function money(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function RadioOption({
  selected,
  onSelect,
  icon,
  label,
  description,
  price,
  priceColor = "text-sj-navy",
  note,
  subNote,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
  price: string;
  priceColor?: string;
  note?: string;
  subNote?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`border rounded-lg transition cursor-pointer ${
        selected ? "border-sj-blue bg-sj-blue-50/30" : "border-sj-gray-200 bg-white hover:border-sj-gray-300"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? "border-sj-blue" : "border-sj-gray-300"
        }`}>
          {selected && <div className="h-2.5 w-2.5 rounded-full bg-sj-blue" />}
        </div>

        <div className="flex items-center gap-2">
          {icon}
          <span className="font-bold text-sm text-sj-navy">{label}</span>
        </div>

        <span className="text-sm text-sj-gray-600 flex-1">{description}</span>

        <span className={`font-bold text-sm ${priceColor}`}>{price}</span>
      </div>

      {subNote && (
        <div className="px-5 pb-2 -mt-1">
          <span className="text-xs text-sj-blue font-medium">{subNote}</span>
        </div>
      )}

      {note && (
        <div className="border-t border-sj-gray-100 px-5 py-2">
          <p className="text-[11px] text-sj-gray-400 italic">{note}</p>
        </div>
      )}

      {selected && children && (
        <div className="border-t border-sj-gray-100 px-5 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

function DateSlotPicker({
  dates,
  selectedDate,
  selectedSlot,
  onSelectDate,
  onSelectSlot,
}: {
  dates: ScheduleDate[];
  selectedDate: string | null;
  selectedSlot: string | null;
  onSelectDate: (d: string) => void;
  onSelectSlot: (s: string) => void;
}) {
  const activeDate = dates.find((d) => d.date === selectedDate);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold text-sj-gray-600">Escolha a data e horário</p>
      <div className="flex gap-2 flex-wrap">
        {dates.map((d) => (
          <button
            key={d.date}
            onClick={(e) => { e.stopPropagation(); onSelectDate(d.date); }}
            className={`rounded-lg px-4 py-2.5 text-center transition border ${
              selectedDate === d.date
                ? "border-sj-blue bg-sj-blue text-white"
                : "border-sj-gray-200 bg-white text-sj-gray-600 hover:border-sj-blue"
            }`}
          >
            <p className="text-[11px] font-medium">{d.dayOfWeek.slice(0, 3)}</p>
            <p className="text-sm font-bold">{d.label}</p>
          </button>
        ))}
      </div>

      {activeDate && (
        <div className="flex gap-2 flex-wrap">
          {activeDate.slots.map((slot) => (
            <button
              key={slot}
              onClick={(e) => { e.stopPropagation(); onSelectSlot(slot); }}
              className={`rounded-lg px-4 py-2.5 transition border flex items-center gap-2 ${
                selectedSlot === slot
                  ? "border-sj-blue bg-sj-blue text-white"
                  : "border-sj-gray-200 bg-white text-sj-gray-600 hover:border-sj-blue"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">{slot}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PackageItemsTable({
  items,
  onRemoveItem,
}: {
  items: PackageItem[];
  onRemoveItem?: (productId: string) => void;
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-sj-gray-200 text-xs text-sj-gray-500 uppercase tracking-wider">
          <th className="text-left py-3 px-4 font-semibold">Item</th>
          <th className="text-center py-3 px-2 font-semibold w-28">Preço</th>
          <th className="text-center py-3 px-2 font-semibold w-28">Quantidade</th>
          <th className="text-center py-3 px-2 font-semibold w-28">Total</th>
          {onRemoveItem && <th className="w-12" />}
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.product.id} className="border-b border-sj-gray-100">
            <td className="py-4 px-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-lg bg-sj-gray-50 flex items-center justify-center text-2xl shrink-0 relative">
                  {item.product.imageEmoji}
                  <span className="absolute -top-1 -right-1 bg-sj-blue text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {item.fulfilledQty}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-sj-navy leading-snug">{item.product.name}</p>
                  <p className="text-xs text-sj-gray-500 mt-0.5">{item.product.description}</p>
                </div>
              </div>
            </td>
            <td className="text-center py-4 px-2">
              <span className="text-sm font-semibold text-sj-navy">{money(item.product.price)}</span>
            </td>
            <td className="text-center py-4 px-2">
              <span className="text-sm text-sj-gray-600">
                {item.fulfilledQty} {item.fulfilledQty === 1 ? "unidade" : "unidades"}
              </span>
            </td>
            <td className="text-center py-4 px-2">
              <span className="text-sm font-bold text-sj-navy">
                {money(item.product.price * item.fulfilledQty)}
              </span>
            </td>
            {onRemoveItem && (
              <td className="py-4 px-2 text-center">
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-sj-gray-400 hover:text-sj-red transition p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PanvelPackageCard({
  packageNumber,
  totalPackages,
  storeName,
  items,
  children,
  onDecline,
}: {
  packageNumber: number;
  totalPackages: number;
  storeName?: string;
  items: PackageItem[];
  children: React.ReactNode;
  onDecline?: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-sj-gray-200 overflow-hidden shadow-sm">
      <div className="bg-sj-navy px-6 py-3 flex items-center gap-3">
        <Package className="h-5 w-5 text-white/80" />
        <h3 className="text-white font-bold text-sm">
          Pacote {packageNumber} de {totalPackages} por <span className="text-sj-yellow">São João{storeName ? ` — ${storeName}` : ""}</span>
        </h3>
      </div>

      <PackageItemsTable items={items} />

      <div className="px-6 py-5 border-t border-sj-gray-200">
        <h4 className="text-sm font-bold text-sj-navy mb-4">Selecione uma opção</h4>
        <div className="flex flex-col gap-3">
          {children}
        </div>
      </div>

      {onDecline && (
        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onDecline}
            className="flex items-center gap-2 text-sj-red text-sm font-bold hover:text-sj-red-dark transition"
          >
            <Trash2 className="h-4 w-4" />
            NÃO QUERO RECEBER ESTE PACOTE
          </button>
        </div>
      )}
    </div>
  );
}

function StorePackageSection({
  pkg,
  packageNumber,
  totalPackages,
  mode,
  onChangeMode,
  schedDate,
  schedSlot,
  onSelectDate,
  onSelectSlot,
}: {
  pkg: StorePackage;
  packageNumber: number;
  totalPackages: number;
  mode: StoreDeliveryMode;
  onChangeMode: (m: StoreDeliveryMode) => void;
  schedDate: string | null;
  schedSlot: string | null;
  onSelectDate: (d: string) => void;
  onSelectSlot: (s: string) => void;
}) {
  return (
    <PanvelPackageCard
      packageNumber={packageNumber}
      totalPackages={totalPackages}
      storeName={pkg.store.name}
      items={pkg.items}
    >
      <RadioOption
        selected={mode === "rapida"}
        onSelect={() => onChangeMode("rapida")}
        icon={<Zap className="h-4 w-4 text-sj-orange" />}
        label="Entrega Rápida"
        description="receba em até 2 horas*"
        price={pkg.deliveryModes.rapida.shippingCost === 0 ? "Grátis" : money(pkg.deliveryModes.rapida.shippingCost)}
        priceColor={pkg.deliveryModes.rapida.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
        note="*O prazo de entrega será contado após a confirmação do pagamento."
      />

      <RadioOption
        selected={mode === "programada"}
        onSelect={() => onChangeMode("programada")}
        icon={<CalendarDays className="h-4 w-4 text-sj-blue" />}
        label="Entrega Programada"
        description="receba no seu melhor dia e hora*"
        price={pkg.deliveryModes.programada.shippingCost === 0 ? "Grátis" : money(pkg.deliveryModes.programada.shippingCost)}
        priceColor={pkg.deliveryModes.programada.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
        note="*O prazo de entrega será contado após a confirmação do pagamento."
      >
        <DateSlotPicker
          dates={pkg.deliveryModes.programada.availableDates}
          selectedDate={schedDate}
          selectedSlot={schedSlot}
          onSelectDate={onSelectDate}
          onSelectSlot={onSelectSlot}
        />
      </RadioOption>
    </PanvelPackageCard>
  );
}

function OtherStorePackageCard({
  pkg,
  items,
  packageNumber,
  totalPackages,
  schedDate,
  schedSlot,
  onSelectDate,
  onSelectSlot,
}: {
  pkg: OtherStorePackage;
  items: PackageItem[];
  packageNumber: number;
  totalPackages: number;
  schedDate: string | null;
  schedSlot: string | null;
  onSelectDate: (d: string) => void;
  onSelectSlot: (s: string) => void;
}) {
  return (
    <PanvelPackageCard
      packageNumber={packageNumber}
      totalPackages={totalPackages}
      storeName={pkg.store.name}
      items={items}
    >
      <RadioOption
        selected={true}
        onSelect={() => {}}
        icon={<Store className="h-4 w-4 text-sj-blue" />}
        label="Entrega Programada"
        description={`envio pela filial ${pkg.store.name} (${pkg.store.distanceKm.toFixed(1)} km)*`}
        price={pkg.deliveryModes.programada.shippingCost === 0 ? "Grátis" : money(pkg.deliveryModes.programada.shippingCost)}
        priceColor={pkg.deliveryModes.programada.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
        note="*O prazo de entrega será contado após a confirmação do pagamento."
      >
        <DateSlotPicker
          dates={pkg.deliveryModes.programada.availableDates}
          selectedDate={schedDate}
          selectedSlot={schedSlot}
          onSelectDate={onSelectDate}
          onSelectSlot={onSelectSlot}
        />
      </RadioOption>
    </PanvelPackageCard>
  );
}

function CDPackageCard({
  pkg,
  items,
  packageNumber,
  totalPackages,
  schedDate,
  schedSlot,
  onSelectDate,
  onSelectSlot,
}: {
  pkg: CDPackage;
  items: PackageItem[];
  packageNumber: number;
  totalPackages: number;
  schedDate: string | null;
  schedSlot: string | null;
  onSelectDate: (d: string) => void;
  onSelectSlot: (s: string) => void;
}) {
  return (
    <PanvelPackageCard
      packageNumber={packageNumber}
      totalPackages={totalPackages}
      storeName={pkg.lastMileStore.name}
      items={items}
    >
      <RadioOption
        selected={true}
        onSelect={() => {}}
        icon={<CalendarDays className="h-4 w-4 text-sj-orange" />}
        label="Entrega Programada"
        description={`disponível a partir de ${pkg.availableDates[0]?.label ?? ""} (${pkg.transitDaysToStore} dias para o CD enviar à filial)*`}
        price={pkg.shippingCost === 0 ? "Grátis" : money(pkg.shippingCost)}
        priceColor={pkg.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
        note="*Prazo de 3 dias para o CD enviar os produtos à filial. A entrega será realizada pela filial mais próxima."
      >
        <DateSlotPicker
          dates={pkg.availableDates}
          selectedDate={schedDate}
          selectedSlot={schedSlot}
          onSelectDate={onSelectDate}
          onSelectSlot={onSelectSlot}
        />
      </RadioOption>
    </PanvelPackageCard>
  );
}

function FullOrderSection({
  pkg,
  schedDate,
  schedSlot,
  onSelectDate,
  onSelectSlot,
}: {
  pkg: FullOrderPackage;
  schedDate: string | null;
  schedSlot: string | null;
  onSelectDate: (d: string) => void;
  onSelectSlot: (s: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-sj-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-sj-gray-200">
        <h3 className="text-lg font-bold text-sj-navy">Retire em loja ou receba tudo junto</h3>
      </div>

      <div className="bg-sj-navy px-6 py-3 flex items-center gap-3">
        <PackageCheck className="h-5 w-5 text-white/80" />
        <h4 className="text-white font-bold text-sm">
          Vendido e entregue por <span className="text-sj-yellow">São João</span>
        </h4>
      </div>

      <div className="px-6 py-5">
        <h4 className="text-sm font-bold text-sj-navy mb-4">Selecione uma opção</h4>
        <div className="flex flex-col gap-3">
          <RadioOption
            selected={false}
            onSelect={() => {}}
            icon={<Store className="h-4 w-4 text-sj-green" />}
            label="Retirada em Loja"
            description="retire a partir de 30 minutos.*"
            price="Grátis"
            priceColor="text-sj-green"
            note="*O prazo de retirada será contado após a confirmação do pagamento."
          />

          <RadioOption
            selected={true}
            onSelect={() => {}}
            icon={<CalendarDays className="h-4 w-4 text-sj-blue" />}
            label="Entrega Programada"
            description="receba no seu melhor dia e hora*"
            price={pkg.shippingCost === 0 ? "Grátis" : money(pkg.shippingCost)}
            priceColor={pkg.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
            note="*O prazo de entrega será contado após a confirmação do pagamento."
          >
            <DateSlotPicker
              dates={pkg.availableDates}
              selectedDate={schedDate}
              selectedSlot={schedSlot}
              onSelectDate={onSelectDate}
              onSelectSlot={onSelectSlot}
            />
          </RadioOption>
        </div>
      </div>
    </div>
  );
}

function UnavailableItemsBanner({
  items,
  onChangeAddress,
  onRemoveItems,
}: {
  items: PackageItem[];
  onChangeAddress: () => void;
  onRemoveItems: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border border-sj-gray-200 overflow-hidden shadow-sm">
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900">
          Alguns itens estão indisponíveis para o endereço selecionado. Tente a opção{" "}
          <button onClick={onChangeAddress} className="font-bold text-sj-orange underline">retirada em loja</button>{" "}
          ou{" "}
          <button onClick={onChangeAddress} className="font-bold text-sj-blue underline">alterar o endereço</button>{" "}
          selecionado.
        </p>
      </div>

      {items.map((item) => (
        <div key={item.product.id} className="px-6 py-4 flex items-center gap-4 border-b border-sj-gray-100 last:border-0">
          <div className="h-14 w-14 rounded-lg bg-sj-gray-50 flex items-center justify-center text-2xl shrink-0">
            {item.product.imageEmoji}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-sj-navy">{item.product.name}</p>
            <p className="text-sm text-sj-orange mt-0.5">
              {item.fulfilledQty} {item.fulfilledQty === 1 ? "unidade indisponível" : "unidades indisponíveis"} :(
            </p>
          </div>
          <button className="text-sm font-medium text-sj-gray-600 border border-sj-gray-300 rounded-full px-4 py-1.5 hover:bg-sj-gray-50 transition">
            Ver semelhantes
          </button>
        </div>
      ))}

      <div className="px-6 py-4 flex gap-4">
        <button
          onClick={onChangeAddress}
          className="flex-1 h-11 rounded-lg border-2 border-sj-navy text-sj-navy text-sm font-bold hover:bg-sj-gray-50 transition"
        >
          ALTERAR ENDEREÇO
        </button>
        <button
          onClick={onRemoveItems}
          className="flex-1 h-11 rounded-lg border-2 border-sj-gray-300 text-sj-gray-600 text-sm font-bold hover:bg-sj-gray-50 transition"
        >
          REMOVER ITENS
        </button>
      </div>
    </div>
  );
}

export default function CheckoutScreen() {
  const { cart, cartTotal, setScreen, customer, setCustomer, setConfirmedOrder } = useApp();

  const [cep, setCep] = useState(customer?.cep || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<DeliveryPlan | null>(null);

  const [storeMode, setStoreMode] = useState<StoreDeliveryMode>("rapida");
  const [storeSchedDate, setStoreSchedDate] = useState<string | null>(null);
  const [storeSchedSlot, setStoreSchedSlot] = useState<string | null>(null);
  const [remainingSource, setRemainingSource] = useState<RemainingSource>("otherStore");
  const [osSchedDate, setOsSchedDate] = useState<string | null>(null);
  const [osSchedSlot, setOsSchedSlot] = useState<string | null>(null);
  const [cdSchedDate, setCdSchedDate] = useState<string | null>(null);
  const [cdSchedSlot, setCdSchedSlot] = useState<string | null>(null);
  const [fullSchedDate, setFullSchedDate] = useState<string | null>(null);
  const [fullSchedSlot, setFullSchedSlot] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function handleSearch() {
    try {
      setLoading(true);
      setError("");
      setPlan(null);
      setStoreMode("rapida");
      setStoreSchedDate(null);
      setStoreSchedSlot(null);
      setRemainingSource("otherStore");
      setOsSchedDate(null);
      setOsSchedSlot(null);
      setCdSchedDate(null);
      setCdSchedSlot(null);
      setFullSchedDate(null);
      setFullSchedSlot(null);

      const addr = await fetchAddressByCEP(cep);
      setCustomer(addr);
      const newPlan = calculateDeliveryPlan(addr, ALL_STORES, cart);
      setPlan(newPlan);
      setRemainingSource(newPlan.otherStorePackages.length > 0 ? "otherStore" : "cd");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao consultar CEP");
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div>
        <SJHeader showSearch={false} />
        <div className="max-w-[900px] mx-auto px-6 py-16 flex flex-col items-center gap-4">
          <Package className="h-16 w-16 text-sj-gray-300" />
          <h2 className="text-xl font-bold text-sj-navy">Nada para entregar</h2>
          <p className="text-sj-gray-500">Adicione produtos ao carrinho primeiro</p>
          <button
            onClick={() => setScreen("home")}
            className="mt-2 h-11 px-8 rounded-lg bg-sj-blue text-white font-bold hover:bg-sj-blue-dark transition"
          >
            Ver produtos
          </button>
        </div>
      </div>
    );
  }

  const hasMissingItems = (plan?.otherStorePackages?.length ?? 0) > 0 || !!plan?.cdPackage;

  const splitStoreShipping =
    plan?.storePackage
      ? storeMode === "rapida"
        ? plan.storePackage.deliveryModes.rapida.shippingCost
        : plan.storePackage.deliveryModes.programada.shippingCost
      : 0;
  const splitRemainingShipping = hasMissingItems
    ? remainingSource === "otherStore" && (plan?.otherStorePackages?.length ?? 0) > 0
      ? plan!.otherStorePackages[0].deliveryModes.programada.shippingCost
      : plan?.cdPackage?.shippingCost ?? 0
    : 0;
  const totalShipping = splitStoreShipping + splitRemainingShipping;
  const finalTotal = cartTotal + totalShipping;

  const totalPackages =
    (plan?.storePackage ? 1 : 0) +
    (plan?.otherStorePackages?.length ? 1 : 0) +
    (plan?.cdPackage ? 1 : 0);

  const remainingReady = !hasMissingItems || (
    remainingSource === "otherStore"
      ? !!(osSchedDate && osSchedSlot)
      : !!(cdSchedDate && cdSchedSlot)
  );

  const canConfirm =
    plan &&
    (plan.storePackage
      ? storeMode === "rapida" || (storeSchedDate && storeSchedSlot)
      : true) &&
    remainingReady;

  function handleConfirm() {
    if (!plan || !customer || !canConfirm) return;
    setConfirming(true);
    const orderId = `SJ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setTimeout(() => {
      const otherSchedulesClean: Record<string, { date: string; slot: string }> = {};
      if (remainingSource === "otherStore" && osSchedDate && osSchedSlot) {
        for (const osPkg of plan.otherStorePackages) {
          otherSchedulesClean[osPkg.store.code] = { date: osSchedDate, slot: osSchedSlot };
        }
      }

      setConfirmedOrder({
        orderId,
        plan: {
          ...plan,
          otherStorePackages: remainingSource === "otherStore" ? plan.otherStorePackages : [],
          cdPackage: remainingSource === "cd" ? plan.cdPackage : null,
        },
        customer,
        deliveryOption: "split",
        storeMode,
        storeSchedule:
          storeMode === "programada" && storeSchedDate && storeSchedSlot
            ? { date: storeSchedDate, slot: storeSchedSlot }
            : null,
        otherStoreSchedules: otherSchedulesClean,
        cdSchedule:
          remainingSource === "cd" && cdSchedDate && cdSchedSlot
            ? { date: cdSchedDate, slot: cdSchedSlot }
            : null,
        fullSchedule:
          fullSchedDate && fullSchedSlot
            ? { date: fullSchedDate, slot: fullSchedSlot }
            : null,
        totalProducts: cartTotal,
        totalShipping,
        totalFinal: finalTotal,
        confirmedAt: new Date(),
        items: [...cart],
      });
      setScreen("confirmed");
      setConfirming(false);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <SJHeader showSearch={false} />

      <div className="max-w-[900px] mx-auto px-6 py-6">
        <button
          onClick={() => setScreen("cart")}
          className="flex items-center gap-1.5 text-sj-blue text-sm font-medium mb-4 hover:text-sj-blue-dark transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao carrinho
        </button>

        <h1 className="text-2xl font-bold text-sj-navy mb-6">Calcular Entrega</h1>

        <div className="flex flex-col gap-6">
          {/* CEP input */}
          <div className="bg-white rounded-lg border border-sj-gray-200 p-6 shadow-sm">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-sm font-bold text-sj-navy mb-2 block">
                  CEP de entrega
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-sj-gray-400" />
                  <input
                    value={cep}
                    onChange={(e) => setCep(formatCEP(e.target.value))}
                    placeholder="00000-000"
                    className="w-full h-12 rounded-lg border border-sj-gray-200 pl-11 pr-4 text-sm text-sj-navy font-medium outline-none focus:border-sj-blue transition"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="h-12 px-6 rounded-lg bg-sj-blue text-white font-bold hover:bg-sj-blue-dark transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>Buscar</span>
              </button>
            </div>

            {customer && (
              <div className="mt-4 bg-sj-gray-50 rounded-lg px-4 py-3 flex items-center gap-3">
                <MapPin className="h-4 w-4 text-sj-blue shrink-0" />
                <p className="text-sm text-sj-gray-600">
                  {customer.street ? `${customer.street}, ` : ""}
                  {customer.district ? `${customer.district}, ` : ""}
                  <strong>{customer.city}, {customer.state}</strong>
                  {customer.cep ? ` - ${customer.cep}` : ""}
                </p>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg bg-sj-red-light border border-sj-red/20 px-4 py-3 text-sm text-sj-red flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </div>

          {plan && (
            <>
              {/* Unavailable items banner — only for items no store can fulfill (CD) */}
              {plan.cdPackage && plan.cdPackage.items.length > 0 && (
                <UnavailableItemsBanner
                  items={plan.cdPackage.items}
                  onChangeAddress={() => { setCep(""); setPlan(null); setCustomer(null); }}
                  onRemoveItems={() => {}}
                />
              )}

              {/* Pacote 1 — Filial mais próxima envia o que tem */}
              <div>
                {plan.storePackage && (
                  <StorePackageSection
                    pkg={plan.storePackage}
                    packageNumber={1}
                    totalPackages={totalPackages}
                    mode={storeMode}
                    onChangeMode={(m) => { setStoreMode(m); }}
                    schedDate={storeSchedDate}
                    schedSlot={storeSchedSlot}
                    onSelectDate={(d) => { setStoreSchedDate(d); setStoreSchedSlot(null); }}
                    onSelectSlot={(s) => { setStoreSchedSlot(s); }}
                  />
                )}
              </div>

              {/* Pacote 2 — Outra filial envia os itens restantes */}
              {plan.otherStorePackages.length > 0 && plan.otherStorePackages[0] && (
                <div
                  onClick={() => {
                    if (remainingSource !== "otherStore") {
                      setRemainingSource("otherStore");
                      setCdSchedDate(null);
                      setCdSchedSlot(null);
                    }
                  }}
                  className={`transition-opacity ${
                    remainingSource === "cd" ? "opacity-40 cursor-pointer" : ""
                  }`}
                >
                  <OtherStorePackageCard
                    pkg={plan.otherStorePackages[0]}
                    items={plan.cdPackage?.items ?? []}
                    packageNumber={(plan.storePackage ? 1 : 0) + 1}
                    totalPackages={totalPackages}
                    schedDate={osSchedDate}
                    schedSlot={osSchedSlot}
                    onSelectDate={(d) => { setRemainingSource("otherStore"); setOsSchedDate(d); setOsSchedSlot(null); }}
                    onSelectSlot={(s) => { setOsSchedSlot(s); }}
                  />
                </div>
              )}

              {/* Pacote 3 — CD envia para a filial, ela entrega (3 dias) */}
              {plan.cdPackage && (
                <div
                  onClick={() => {
                    if (remainingSource !== "cd") {
                      setRemainingSource("cd");
                      setOsSchedDate(null);
                      setOsSchedSlot(null);
                    }
                  }}
                  className={`transition-opacity ${
                    remainingSource === "otherStore" && plan.otherStorePackages.length > 0
                      ? "opacity-40 cursor-pointer"
                      : ""
                  }`}
                >
                  <CDPackageCard
                    pkg={plan.cdPackage}
                    items={plan.cdPackage.items}
                    packageNumber={(plan.storePackage ? 1 : 0) + (plan.otherStorePackages.length > 0 ? 1 : 0) + 1}
                    totalPackages={totalPackages}
                    schedDate={cdSchedDate}
                    schedSlot={cdSchedSlot}
                    onSelectDate={(d) => { setRemainingSource("cd"); setCdSchedDate(d); setCdSchedSlot(null); }}
                    onSelectSlot={(s) => { setCdSchedSlot(s); }}
                  />
                </div>
              )}

              {/* Pacote 4 — Receber tudo junto daqui 3 dias */}
              {!plan.allAvailableAtStore && (
                <FullOrderSection
                  pkg={plan.fullOrderPackage}
                  schedDate={fullSchedDate}
                  schedSlot={fullSchedSlot}
                  onSelectDate={(d) => { setFullSchedDate(d); setFullSchedSlot(null); }}
                  onSelectSlot={(s) => { setFullSchedSlot(s); }}
                />
              )}

              {/* Summary & confirm */}
              <div className="bg-white rounded-lg border border-sj-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 text-sm text-sj-gray-500">
                      <span>Subtotal: {money(cartTotal)}</span>
                      <span className="text-sj-gray-300">|</span>
                      <span>
                        Frete:{" "}
                        {totalShipping === 0 ? (
                          <span className="text-sj-green font-bold">Grátis</span>
                        ) : (
                          money(totalShipping)
                        )}
                      </span>
                    </div>
                    <p className="text-2xl font-extrabold text-sj-navy mt-1">
                      Total: {money(finalTotal)}
                    </p>
                  </div>
                  <button
                    disabled={!canConfirm || confirming}
                    onClick={handleConfirm}
                    className="h-12 px-8 rounded-lg bg-sj-blue text-white font-bold hover:bg-sj-blue-dark transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                  >
                    {confirming ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processando…
                      </>
                    ) : (
                      <>
                        <Truck className="h-5 w-5" />
                        FINALIZAR PEDIDO
                      </>
                    )}
                  </button>
                </div>

                {plan.nearestStore && (
                  <p className="text-xs text-sj-gray-500">
                    Filial mais próxima: <strong>{plan.nearestStore.name}</strong> — {plan.nearestStore.distanceKm.toFixed(1)} km
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
