import { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShieldCheck,
  MapPin,
  Search,
  Truck,
  Clock,
  Zap,
  CalendarDays,
  Store,
  Package,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PRODUCTS } from "../data/products";
import { ALL_STORES } from "../data/stores";
import { formatCEP, fetchAddressByCEP } from "../lib/geo";
import {
  calculateDeliveryPlan,
  type DeliveryPlan,
  type PackageItem,
  type ScheduleDate,
  type FullOrderPackage,
} from "../lib/delivery";

type StoreDeliveryMode = "retirada" | "rapida" | "programada";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FREE_SHIPPING_THRESHOLD = 149.9;
const FAST_SHIPPING_THRESHOLD = 299.9;
const BEST_SELLERS = PRODUCTS.filter((p) => p.originalPrice !== null).slice(0, 6);

/* ── Progress Stepper ── */
function ProgressStepper({ step }: { step: number }) {
  const steps = [
    { label: "Cesta", icon: ShoppingBag },
    { label: "Entrega", icon: Truck },
    { label: "Confirmação", icon: CheckCircle2 },
  ];
  return (
    <div className="flex items-center justify-center gap-0 py-4">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const isActive = i <= step;
        return (
          <div key={i} className="flex items-center">
            {i > 0 && <div className={`h-1 w-16 md:w-24 ${i <= step ? "bg-sj-blue" : "bg-sj-gray-200"}`} />}
            <div className="flex flex-col items-center gap-1">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isActive ? "bg-sj-blue text-white" : "bg-sj-gray-200 text-sj-gray-400"}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-semibold ${isActive ? "text-sj-navy" : "text-sj-gray-400"}`}>{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Delivery sub-components ── */
function RadioOption({
  selected, onSelect, icon, label, description, price,
  priceColor = "text-sj-navy", note, children,
}: {
  selected: boolean; onSelect: () => void; icon: React.ReactNode;
  label: string; description: string; price: string;
  priceColor?: string; note?: string; children?: React.ReactNode;
}) {
  return (
    <div
      className={`border rounded-lg transition cursor-pointer ${selected ? "border-sj-blue bg-sj-blue-50/30" : "border-sj-gray-200 bg-white hover:border-sj-gray-300"}`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-sj-blue" : "border-sj-gray-300"}`}>
          {selected && <div className="h-2.5 w-2.5 rounded-full bg-sj-blue" />}
        </div>
        <div className="flex items-center gap-2">{icon}<span className="font-bold text-sm text-sj-navy">{label}</span></div>
        <span className="text-sm text-sj-gray-600 flex-1">{description}</span>
        <span className={`font-bold text-sm ${priceColor}`}>{price}</span>
      </div>
      {note && <div className="border-t border-sj-gray-100 px-5 py-2"><p className="text-[11px] text-sj-gray-400 italic">{note}</p></div>}
      {selected && children && <div className="border-t border-sj-gray-100 px-5 py-4">{children}</div>}
    </div>
  );
}

function DateSlotPicker({
  dates, selectedDate, selectedSlot, onSelectDate, onSelectSlot,
}: {
  dates: ScheduleDate[]; selectedDate: string | null; selectedSlot: string | null;
  onSelectDate: (d: string) => void; onSelectSlot: (s: string) => void;
}) {
  const activeDate = dates.find((d) => d.date === selectedDate);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold text-sj-gray-600">Escolha a data e horário</p>
      <div className="flex gap-2 flex-wrap">
        {dates.map((d) => (
          <button key={d.date} onClick={(e) => { e.stopPropagation(); onSelectDate(d.date); }}
            className={`rounded-lg px-4 py-2.5 text-center transition border ${selectedDate === d.date ? "border-sj-blue bg-sj-blue text-white" : "border-sj-gray-200 bg-white text-sj-gray-600 hover:border-sj-blue"}`}>
            <p className="text-[11px] font-medium">{d.dayOfWeek.slice(0, 3)}</p>
            <p className="text-sm font-bold">{d.label}</p>
          </button>
        ))}
      </div>
      {activeDate && (
        <div className="flex gap-2 flex-wrap">
          {activeDate.slots.map((slot) => (
            <button key={slot} onClick={(e) => { e.stopPropagation(); onSelectSlot(slot); }}
              className={`rounded-lg px-4 py-2.5 transition border flex items-center gap-2 ${selectedSlot === slot ? "border-sj-blue bg-sj-blue text-white" : "border-sj-gray-200 bg-white text-sj-gray-600 hover:border-sj-blue"}`}>
              <Clock className="h-3.5 w-3.5" /><span className="text-sm font-semibold">{slot}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PackageItemsTable({ items }: { items: PackageItem[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-sj-gray-200 text-xs text-sj-gray-500 uppercase tracking-wider">
          <th className="text-left py-3 px-4 font-semibold">Item</th>
          <th className="text-center py-3 px-2 font-semibold w-24">Preço</th>
          <th className="text-center py-3 px-2 font-semibold w-20">Qtd</th>
          <th className="text-center py-3 px-2 font-semibold w-24">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.product.id} className="border-b border-sj-gray-100">
            <td className="py-3 px-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-sj-gray-50 flex items-center justify-center text-xl shrink-0 relative">
                  {item.product.imageEmoji}
                  <span className="absolute -top-1 -right-1 bg-sj-blue text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{item.fulfilledQty}</span>
                </div>
                <p className="text-xs font-medium text-sj-navy leading-snug line-clamp-2">{item.product.name}</p>
              </div>
            </td>
            <td className="text-center py-3 px-2"><span className="text-xs font-semibold text-sj-navy">{money(item.product.price)}</span></td>
            <td className="text-center py-3 px-2"><span className="text-xs text-sj-gray-600">{item.fulfilledQty}</span></td>
            <td className="text-center py-3 px-2"><span className="text-xs font-bold text-sj-navy">{money(item.product.price * item.fulfilledQty)}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PanvelPackageCard({
  packageNumber, totalPackages, storeName, items, children,
}: {
  packageNumber: number; totalPackages: number; storeName?: string;
  items: PackageItem[]; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-sj-gray-200 overflow-hidden shadow-sm">
      <div className="bg-sj-navy px-5 py-2.5 flex items-center gap-3">
        <Package className="h-4 w-4 text-white/80" />
        <h3 className="text-white font-bold text-xs">
          Pacote {packageNumber} de {totalPackages} por{" "}
          <span className="text-sj-yellow">São João{storeName ? ` — ${storeName}` : ""}</span>
        </h3>
      </div>
      <PackageItemsTable items={items} />
      <div className="px-5 py-4 border-t border-sj-gray-200">
        <h4 className="text-xs font-bold text-sj-navy mb-3">Selecione uma opção</h4>
        <div className="flex flex-col gap-2">{children}</div>
      </div>
    </div>
  );
}

/* ── Main component ── */
export default function CartScreen() {
  const {
    cart, updateQuantity, removeFromCart, cartTotal, cartCount, setScreen,
    addToCart, customer, setCustomer, setConfirmedOrder,
  } = useApp();

  const [cep, setCep] = useState(customer?.cep || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<DeliveryPlan | null>(null);

  const [storeMode, setStoreMode] = useState<StoreDeliveryMode>("rapida");
  const [storeSchedDate, setStoreSchedDate] = useState<string | null>(null);
  const [storeSchedSlot, setStoreSchedSlot] = useState<string | null>(null);
  const [remainingSource, setRemainingSource] = useState<"otherStore" | "cd">("otherStore");
  const [pkg2Mode, setPkg2Mode] = useState<"rapida" | "programada">("rapida");
  const [pkg2SchedDate, setPkg2SchedDate] = useState<string | null>(null);
  const [pkg2SchedSlot, setPkg2SchedSlot] = useState<string | null>(null);
  const [pkg3SchedDate, setPkg3SchedDate] = useState<string | null>(null);
  const [pkg3SchedSlot, setPkg3SchedSlot] = useState<string | null>(null);
  const [deliveryOption, setDeliveryOption] = useState<"split" | "full">("split");
  const [fullSchedDate, setFullSchedDate] = useState<string | null>(null);
  const [fullSchedSlot, setFullSchedSlot] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  async function handleSearch() {
    try {
      setLoading(true);
      setError("");
      setPlan(null);
      setStoreMode("rapida");
      setRemainingSource("otherStore");
      setPkg2Mode("rapida");
      setStoreSchedDate(null); setStoreSchedSlot(null);
      setPkg2SchedDate(null); setPkg2SchedSlot(null);
      setPkg3SchedDate(null); setPkg3SchedSlot(null);
      setDeliveryOption("split");
      setFullSchedDate(null); setFullSchedSlot(null);
      const addr = await fetchAddressByCEP(cep);
      setCustomer(addr);
      const newPlan = calculateDeliveryPlan(addr, ALL_STORES, cart);
      setPlan(newPlan);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao consultar CEP");
    } finally {
      setLoading(false);
    }
  }

  /* ── Shipping totals ── */
  const hasMissingItems = plan ? !plan.allAvailableAtStore : false;
  const activeRemainingSource = plan?.otherStorePackage ? remainingSource : "cd";

  const pkg1Shipping = plan?.storePackage
    ? storeMode === "retirada"
      ? 0
      : storeMode === "rapida"
        ? plan.storePackage.deliveryModes.rapida.shippingCost
        : plan.storePackage.deliveryModes.programada.shippingCost
    : 0;

  const pkg2Shipping = (hasMissingItems && activeRemainingSource === "otherStore" && plan?.otherStorePackage)
    ? pkg2Mode === "rapida"
      ? plan.otherStorePackage.deliveryModes.rapida.shippingCost
      : plan.otherStorePackage.deliveryModes.programada.shippingCost
    : 0;

  const pkg3Shipping = (hasMissingItems && activeRemainingSource === "cd" && plan?.cdPackage)
    ? plan.cdPackage.shippingCost
    : 0;

  const pkg4Shipping = plan?.fullOrderPackage.shippingCost ?? 0;

  const splitShipping = pkg1Shipping + pkg2Shipping + pkg3Shipping;

  const totalShipping = plan
    ? deliveryOption === "full" ? pkg4Shipping : splitShipping
    : 0;

  const finalTotal = cartTotal + totalShipping;

  const splitPackageCount =
    (plan?.storePackage ? 1 : 0) +
    (hasMissingItems && activeRemainingSource === "otherStore" && plan?.otherStorePackage ? 1 : 0) +
    (hasMissingItems && activeRemainingSource === "cd" && plan?.cdPackage ? 1 : 0);

  const totalPackages = deliveryOption === "full" ? 1 : splitPackageCount;

  const pkg2Ready = !(hasMissingItems && activeRemainingSource === "otherStore" && plan?.otherStorePackage) || pkg2Mode === "rapida" || !!(pkg2SchedDate && pkg2SchedSlot);
  const pkg3Ready = !(hasMissingItems && activeRemainingSource === "cd" && plan?.cdPackage) || !!(pkg3SchedDate && pkg3SchedSlot);
  const pkg4Ready = deliveryOption !== "full" || !!(fullSchedDate && fullSchedSlot);

  const canConfirm =
    plan &&
    (deliveryOption === "full"
      ? pkg4Ready
      : (plan.storePackage
          ? storeMode === "retirada" || storeMode === "rapida" || (storeSchedDate && storeSchedSlot)
          : true) &&
        pkg2Ready &&
        pkg3Ready);

  function handleConfirm() {
    if (!plan || !customer || !canConfirm) return;
    setConfirming(true);
    const orderId = `SJ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setTimeout(() => {
      const otherSchedulesClean: Record<string, { date: string; slot: string }> = {};
      if (deliveryOption === "split" && activeRemainingSource === "otherStore" && plan.otherStorePackage && pkg2SchedDate && pkg2SchedSlot) {
        otherSchedulesClean[plan.otherStorePackage.store.code] = { date: pkg2SchedDate, slot: pkg2SchedSlot };
      }
      setConfirmedOrder({
        orderId,
        plan,
        customer,
        deliveryOption,
        remainingSource: activeRemainingSource,
        storeMode,
        pkg2Mode,
        storeSchedule:
          storeMode === "programada" && storeSchedDate && storeSchedSlot
            ? { date: storeSchedDate, slot: storeSchedSlot } : null,
        otherStoreSchedules: otherSchedulesClean,
        cdSchedule:
          deliveryOption === "split" && activeRemainingSource === "cd" && plan.cdPackage && pkg3SchedDate && pkg3SchedSlot
            ? { date: pkg3SchedDate, slot: pkg3SchedSlot } : null,
        fullSchedule:
          deliveryOption === "full" && fullSchedDate && fullSchedSlot
            ? { date: fullSchedDate, slot: fullSchedSlot } : null,
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

  const freeShippingRemaining = Math.max(FREE_SHIPPING_THRESHOLD - cartTotal, 0);
  const freeShippingProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const fastShippingRemaining = Math.max(FAST_SHIPPING_THRESHOLD - cartTotal, 0);
  const fastShippingProgress = Math.min((cartTotal / FAST_SHIPPING_THRESHOLD) * 100, 100);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <CartHeader />
        <div className="max-w-[1200px] mx-auto w-full px-6 py-8">
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm">
            <ShoppingBag className="h-16 w-16 text-sj-gray-300 mb-4" />
            <h2 className="text-lg font-bold text-sj-blue">Seu carrinho está vazio</h2>
            <p className="text-sm text-sj-gray-500 mt-1.5">Navegue pelo site para encontrar seus produtos</p>
            <button onClick={() => setScreen("home")} className="mt-5 h-11 px-8 rounded-lg bg-sj-blue text-white font-bold hover:bg-sj-blue-dark transition">
              Escolher produtos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <CartHeader />
      <ProgressStepper step={plan ? 1 : 0} />

      <div className="max-w-[1200px] mx-auto w-full px-6 pb-10">
        <div className="flex gap-6">
          {/* ── Left column ── */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-sj-navy mb-4">Minha cesta</h1>

            {/* Cart table */}
            <div className="bg-white rounded-lg border border-sj-gray-200 overflow-hidden shadow-sm mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sj-gray-200 text-xs text-sj-gray-500 uppercase tracking-wider">
                    <th className="text-left py-3 px-5 font-semibold">Produto</th>
                    <th className="text-center py-3 px-2 font-semibold w-24">Preço</th>
                    <th className="text-center py-3 px-2 font-semibold w-32">Quantidade</th>
                    <th className="text-center py-3 px-2 font-semibold w-24">Total</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.product.id} className="border-b border-sj-gray-100 last:border-0">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-lg bg-sj-gray-50 flex items-center justify-center text-3xl shrink-0">{item.product.imageEmoji}</div>
                          <div>
                            <p className="text-sm font-semibold text-sj-navy">{item.product.name}</p>
                            <p className="text-xs text-sj-gray-500 mt-0.5">{item.product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-2"><span className="text-sm font-bold text-sj-navy">{money(item.product.price)}</span></td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="h-8 w-8 rounded bg-sj-blue flex items-center justify-center text-white hover:bg-sj-blue-dark transition"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="text-sm font-bold text-sj-navy w-8 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="h-8 w-8 rounded bg-sj-blue flex items-center justify-center text-white hover:bg-sj-blue-dark transition"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                      <td className="text-center py-4 px-2"><span className="text-sm font-bold text-sj-navy">{money(item.product.price * item.quantity)}</span></td>
                      <td className="py-4 px-2"><button onClick={() => removeFromCart(item.product.id)} className="text-sj-gray-400 hover:text-sj-red transition p-1"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Entrega ── */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-sj-navy mb-4">Entrega</h2>

              {/* CEP */}
              <div className="bg-white rounded-lg border border-sj-gray-200 p-5 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="h-4 w-4 text-sj-blue" />
                  <span className="text-sm text-sj-gray-600">Receber {cartCount} {cartCount === 1 ? "item" : "itens"} em:</span>
                  <div className="flex items-center gap-2 flex-1">
                    <input value={cep} onChange={(e) => setCep(formatCEP(e.target.value))} placeholder="00000-000"
                      className="h-9 w-36 rounded-lg border border-sj-gray-200 px-3 text-sm font-bold text-sj-navy outline-none focus:border-sj-blue transition"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
                    <button onClick={handleSearch} disabled={loading}
                      className="h-9 px-4 rounded-lg border-2 border-sj-blue text-sj-blue font-bold text-xs hover:bg-sj-blue hover:text-white transition disabled:opacity-50 flex items-center gap-1.5">
                      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                      Alterar Endereço
                    </button>
                  </div>
                </div>
                {customer && (
                  <div className="bg-sj-gray-50 rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-sj-blue shrink-0" />
                    <p className="text-xs text-sj-gray-600">
                      {customer.street ? `${customer.street}, ` : ""}{customer.district ? `${customer.district}, ` : ""}
                      <strong>{customer.city}, {customer.state}</strong>
                    </p>
                  </div>
                )}
                {error && (
                  <div className="mt-3 rounded-lg bg-sj-red-light border border-sj-red/20 px-4 py-2.5 text-xs text-sj-red flex items-center gap-2 font-medium">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
                  </div>
                )}
              </div>

              {/* Packages */}
              {plan && (
                <div className="flex flex-col gap-4">
                  {/* ── Delivery option toggle: Split vs Full (só aparece quando há itens faltantes) ── */}
                  {hasMissingItems && (
                    <div className="bg-white rounded-lg border border-sj-gray-200 p-4 shadow-sm">
                      <h4 className="text-xs font-bold text-sj-navy mb-3">Como deseja receber?</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => setDeliveryOption("split")}
                          className={`rounded-lg border-2 px-4 py-3 text-left transition ${deliveryOption === "split" ? "border-sj-blue bg-sj-blue-50/30" : "border-sj-gray-200 bg-white hover:border-sj-gray-300"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${deliveryOption === "split" ? "border-sj-blue" : "border-sj-gray-300"}`}>
                              {deliveryOption === "split" && <div className="h-2 w-2 rounded-full bg-sj-blue" />}
                            </div>
                            <span className="text-sm font-bold text-sj-navy">Receber por pacotes</span>
                          </div>
                          <p className="text-[11px] text-sj-gray-500 ml-6">Receba parte hoje e o restante depois</p>
                        </button>
                        <button onClick={() => setDeliveryOption("full")}
                          className={`rounded-lg border-2 px-4 py-3 text-left transition ${deliveryOption === "full" ? "border-sj-blue bg-sj-blue-50/30" : "border-sj-gray-200 bg-white hover:border-sj-gray-300"}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${deliveryOption === "full" ? "border-sj-blue" : "border-sj-gray-300"}`}>
                              {deliveryOption === "full" && <div className="h-2 w-2 rounded-full bg-sj-blue" />}
                            </div>
                            <span className="text-sm font-bold text-sj-navy">Pedido completo</span>
                          </div>
                          <p className="text-[11px] text-sj-gray-500 ml-6">Todos os itens em até 3 dias</p>
                        </button>
                      </div>
                    </div>
                  )}

                  {(!hasMissingItems || deliveryOption === "split") ? (
                    <>
                      {/* Pacote 1 — Filial mais próxima */}
                      {plan.storePackage && (
                        <PanvelPackageCard
                          packageNumber={1} totalPackages={totalPackages}
                          storeName={plan.storePackage.store.name}
                          items={plan.storePackage.items}
                        >
                          <RadioOption
                            selected={storeMode === "retirada"} onSelect={() => setStoreMode("retirada")}
                            icon={<Store className="h-4 w-4 text-sj-green" />}
                            label="Retirada em Loja" description="retire em até 30 minutos*"
                            price="Grátis" priceColor="text-sj-green"
                            note="*O prazo de retirada será contado após a confirmação do pagamento."
                          />
                          <RadioOption
                            selected={storeMode === "rapida"} onSelect={() => setStoreMode("rapida")}
                            icon={<Zap className="h-4 w-4 text-sj-orange" />}
                            label="Entrega Rápida" description="receba em até 2 horas*"
                            price={plan.storePackage.deliveryModes.rapida.shippingCost === 0 ? "Grátis" : money(plan.storePackage.deliveryModes.rapida.shippingCost)}
                            priceColor={plan.storePackage.deliveryModes.rapida.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
                            note="*O prazo de entrega será contado após a confirmação do pagamento."
                          />
                          <RadioOption
                            selected={storeMode === "programada"} onSelect={() => setStoreMode("programada")}
                            icon={<CalendarDays className="h-4 w-4 text-sj-blue" />}
                            label="Entrega Programada" description="receba no seu melhor dia e hora*"
                            price={plan.storePackage.deliveryModes.programada.shippingCost === 0 ? "Grátis" : money(plan.storePackage.deliveryModes.programada.shippingCost)}
                            priceColor={plan.storePackage.deliveryModes.programada.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
                            note="*O prazo de entrega será contado após a confirmação do pagamento."
                          >
                            <DateSlotPicker
                              dates={plan.storePackage.deliveryModes.programada.availableDates}
                              selectedDate={storeSchedDate} selectedSlot={storeSchedSlot}
                              onSelectDate={(d) => { setStoreSchedDate(d); setStoreSchedSlot(null); }}
                              onSelectSlot={(s) => setStoreSchedSlot(s)}
                            />
                          </RadioOption>
                        </PanvelPackageCard>
                      )}

                      {/* Pacote 2/3 — Itens restantes (toggle entre outra filial e CD) */}
                      {hasMissingItems && (
                        <>
                          {plan.otherStorePackage && plan.cdPackage && (
                            <div className="bg-white rounded-lg border border-sj-gray-200 p-4 shadow-sm">
                              <h4 className="text-xs font-bold text-sj-navy mb-3">Como deseja receber os itens restantes?</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => { setRemainingSource("otherStore"); setPkg3SchedDate(null); setPkg3SchedSlot(null); }}
                                  className={`rounded-lg border-2 px-4 py-3 text-left transition ${activeRemainingSource === "otherStore" ? "border-sj-blue bg-sj-blue-50/30" : "border-sj-gray-200 bg-white hover:border-sj-gray-300"}`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${activeRemainingSource === "otherStore" ? "border-sj-blue" : "border-sj-gray-300"}`}>
                                      {activeRemainingSource === "otherStore" && <div className="h-2 w-2 rounded-full bg-sj-blue" />}
                                    </div>
                                    <span className="text-xs font-bold text-sj-navy">Outra filial</span>
                                  </div>
                                  <p className="text-[10px] text-sj-gray-500 ml-6">Envio por {plan.otherStorePackage.store.name}</p>
                                </button>
                                <button onClick={() => { setRemainingSource("cd"); setPkg2SchedDate(null); setPkg2SchedSlot(null); }}
                                  className={`rounded-lg border-2 px-4 py-3 text-left transition ${activeRemainingSource === "cd" ? "border-sj-blue bg-sj-blue-50/30" : "border-sj-gray-200 bg-white hover:border-sj-gray-300"}`}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${activeRemainingSource === "cd" ? "border-sj-blue" : "border-sj-gray-300"}`}>
                                      {activeRemainingSource === "cd" && <div className="h-2 w-2 rounded-full bg-sj-blue" />}
                                    </div>
                                    <span className="text-xs font-bold text-sj-navy">Encomenda</span>
                                  </div>
                                  <p className="text-[10px] text-sj-gray-500 ml-6">Receba em até 3 dias</p>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Pacote 2 — Outra filial */}
                          {activeRemainingSource === "otherStore" && plan.otherStorePackage && (
                            <PanvelPackageCard
                              packageNumber={plan.storePackage ? 2 : 1} totalPackages={totalPackages}
                              storeName={plan.otherStorePackage.store.name}
                              items={plan.otherStorePackage.items}
                            >
                              <RadioOption
                                selected={pkg2Mode === "rapida"} onSelect={() => setPkg2Mode("rapida")}
                                icon={<Zap className="h-4 w-4 text-sj-orange" />}
                                label="Entrega Rápida" description="receba em até 2 horas*"
                                price={plan.otherStorePackage.deliveryModes.rapida.shippingCost === 0 ? "Grátis" : money(plan.otherStorePackage.deliveryModes.rapida.shippingCost)}
                                priceColor={plan.otherStorePackage.deliveryModes.rapida.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
                                note="*O prazo de entrega será contado após a confirmação do pagamento."
                              />
                              <RadioOption
                                selected={pkg2Mode === "programada"} onSelect={() => setPkg2Mode("programada")}
                                icon={<CalendarDays className="h-4 w-4 text-sj-blue" />}
                                label="Entrega Programada" description="receba no seu melhor dia e hora*"
                                price={plan.otherStorePackage.deliveryModes.programada.shippingCost === 0 ? "Grátis" : money(plan.otherStorePackage.deliveryModes.programada.shippingCost)}
                                priceColor={plan.otherStorePackage.deliveryModes.programada.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
                                note="*O prazo de entrega será contado após a confirmação do pagamento."
                              >
                                <DateSlotPicker
                                  dates={plan.otherStorePackage.deliveryModes.programada.availableDates}
                                  selectedDate={pkg2SchedDate} selectedSlot={pkg2SchedSlot}
                                  onSelectDate={(d) => { setPkg2SchedDate(d); setPkg2SchedSlot(null); }}
                                  onSelectSlot={(s) => setPkg2SchedSlot(s)}
                                />
                              </RadioOption>
                            </PanvelPackageCard>
                          )}

                          {/* Pacote 3 — CD envia para filial */}
                          {activeRemainingSource === "cd" && plan.cdPackage && (
                            <PanvelPackageCard
                              packageNumber={plan.storePackage ? 2 : 1} totalPackages={totalPackages}
                              storeName={plan.cdPackage.lastMileStore.name}
                              items={plan.cdPackage.items}
                            >
                              <RadioOption
                                selected={true} onSelect={() => {}}
                                icon={<CalendarDays className="h-4 w-4 text-sj-orange" />}
                                label="Entrega Programada"
                                description={`disponível a partir de ${plan.cdPackage.availableDates[0]?.label ?? ""}*`}
                                price={plan.cdPackage.shippingCost === 0 ? "Grátis" : money(plan.cdPackage.shippingCost)}
                                priceColor={plan.cdPackage.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
                                note="*O prazo de entrega será contado após a confirmação do pagamento."
                              >
                                <DateSlotPicker
                                  dates={plan.cdPackage.availableDates}
                                  selectedDate={pkg3SchedDate} selectedSlot={pkg3SchedSlot}
                                  onSelectDate={(d) => { setPkg3SchedDate(d); setPkg3SchedSlot(null); }}
                                  onSelectSlot={(s) => setPkg3SchedSlot(s)}
                                />
                              </RadioOption>
                            </PanvelPackageCard>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    /* ── Pacote 4 — Pedido completo via CD ── */
                    <PanvelPackageCard
                      packageNumber={1} totalPackages={1}
                      storeName={plan.fullOrderPackage.lastMileStore.name}
                      items={plan.fullOrderPackage.items}
                    >
                      <RadioOption
                        selected={true} onSelect={() => {}}
                        icon={<CalendarDays className="h-4 w-4 text-sj-orange" />}
                        label="Entrega Programada"
                        description={`pedido completo — disponível a partir de ${plan.fullOrderPackage.availableDates[0]?.label ?? ""}*`}
                        price={plan.fullOrderPackage.shippingCost === 0 ? "Grátis" : money(plan.fullOrderPackage.shippingCost)}
                        priceColor={plan.fullOrderPackage.shippingCost === 0 ? "text-sj-green" : "text-sj-navy"}
                        note="*O prazo de entrega será contado após a confirmação do pagamento."
                      >
                        <DateSlotPicker
                          dates={plan.fullOrderPackage.availableDates}
                          selectedDate={fullSchedDate} selectedSlot={fullSchedSlot}
                          onSelectDate={(d) => { setFullSchedDate(d); setFullSchedSlot(null); }}
                          onSelectSlot={(s) => setFullSchedSlot(s)}
                        />
                      </RadioOption>
                    </PanvelPackageCard>
                  )}
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="mt-8">
              <h2 className="text-lg font-bold text-sj-navy mb-4">Aproveite e adicione à sacola</h2>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
                {BEST_SELLERS.map((product) => {
                  const pct = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
                  return (
                    <div key={product.id} className="bg-white rounded-lg border border-sj-gray-100 overflow-hidden">
                      <div className="h-24 bg-sj-gray-50 flex items-center justify-center text-3xl relative">
                        {product.imageEmoji}
                        {product.originalPrice && <span className="absolute top-1 right-1 bg-sj-red text-white text-[8px] font-bold px-1 py-0.5 rounded">-{pct}%</span>}
                      </div>
                      <div className="p-2.5">
                        <h3 className="text-[11px] font-medium text-sj-navy leading-tight line-clamp-2 h-7">{product.name}</h3>
                        <p className="text-xs font-extrabold text-sj-navy mt-1">{money(product.price)}</p>
                        <button onClick={() => addToCart(product)}
                          className="mt-1.5 w-full h-7 rounded text-[10px] font-bold bg-sj-blue text-white hover:bg-sj-blue-dark transition flex items-center justify-center gap-1">
                          <Plus className="h-3 w-3" /> Adicionar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="w-[320px] shrink-0">
            <div className="sticky top-4 flex flex-col gap-4">
              {/* Coupon */}
              <div className="bg-white rounded-lg border border-sj-gray-200 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-4 w-4 text-sj-blue" />
                  <h3 className="text-sm font-bold text-sj-navy">Cupom de desconto</h3>
                </div>
                <div className="flex gap-2 mb-2">
                  <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Insira o código aqui"
                    className="flex-1 h-9 rounded-lg border border-sj-gray-200 px-3 text-sm outline-none focus:border-sj-blue transition" />
                  <button className="h-9 px-4 rounded-lg border-2 border-sj-blue text-sj-blue font-bold text-xs hover:bg-sj-blue hover:text-white transition">Adicionar</button>
                </div>
                <button className="text-xs font-bold text-sj-blue hover:underline">Ver Cupons</button>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-lg border border-sj-gray-200 p-5 shadow-sm">
                <h3 className="text-sm font-bold text-sj-navy mb-4">Resumo do pedido</h3>
                <div className="flex justify-between text-sm text-sj-gray-600 mb-2">
                  <span>Subtotal</span><span className="text-sj-navy">{money(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-sj-gray-600 mb-3">
                  <span>Entrega</span>
                  <span className="text-sj-navy">
                    {plan ? (totalShipping === 0 ? <span className="text-sj-green font-bold">Grátis</span> : money(totalShipping)) : "—"}
                  </span>
                </div>
                <div className="border-t border-sj-gray-200 pt-3 mb-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-sj-navy">Total da compra:</span>
                    <span className="text-xl font-extrabold text-sj-blue">{money(finalTotal)}</span>
                  </div>
                </div>

                {/* Shipping progress */}
                <div className="mb-2">
                  <p className="text-[11px] text-sj-gray-600 mb-1">
                    {freeShippingRemaining > 0
                      ? <>Faltam <strong className="text-sj-green">{money(freeShippingRemaining)}</strong> para o <strong>FRETE GRÁTIS</strong></>
                      : <strong className="text-sj-green">Frete grátis atingido!</strong>}
                  </p>
                  <div className="h-1.5 bg-sj-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sj-green rounded-full transition-all" style={{ width: `${freeShippingProgress}%` }} />
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-[11px] text-sj-gray-600 mb-1">
                    {fastShippingRemaining > 0
                      ? <>Faltam <strong className="text-sj-blue">{money(fastShippingRemaining)}</strong> para <strong>FRETE GRÁTIS</strong> com <strong>ENTREGA RÁPIDA</strong></>
                      : <strong className="text-sj-blue">Frete grátis com entrega rápida!</strong>}
                  </p>
                  <div className="h-1.5 bg-sj-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sj-blue rounded-full transition-all" style={{ width: `${fastShippingProgress}%` }} />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <Truck className="h-3 w-3 text-sj-green" /><Zap className="h-3 w-3 text-sj-blue" />
                  </div>
                </div>

                {/* Cashback */}
                <div className="flex items-center justify-between bg-sj-gray-50 rounded-lg px-3 py-2.5 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-sj-green/10 flex items-center justify-center"><span className="text-xs">💰</span></div>
                    <div>
                      <p className="text-[11px] font-bold text-sj-navy">Cashback acumulado</p>
                      <p className="text-[10px] text-sj-gray-500">para próxima compra</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-sj-green">+{money(cartTotal * 0.03)}</span>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <button onClick={() => setScreen("home")} className="w-full h-11 rounded-lg border-2 border-sj-blue text-sj-blue font-bold text-sm hover:bg-sj-blue-50 transition">
                    Continuar comprando
                  </button>
                  <button disabled={!canConfirm || confirming} onClick={handleConfirm}
                    className="w-full h-11 rounded-lg bg-sj-red text-white font-bold text-sm hover:bg-sj-red-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {confirming ? <><Loader2 className="h-4 w-4 animate-spin" />Processando…</> : "Finalizar compra"}
                  </button>
                </div>

                {plan?.nearestStore && (
                  <p className="text-[10px] text-sj-gray-500 mt-3 text-center">
                    Filial mais próxima: <strong>{plan.nearestStore.name}</strong> — {plan.nearestStore.distanceKm.toFixed(1)} km
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartHeader() {
  const { setScreen } = useApp();
  return (
    <header className="w-full bg-white border-b border-sj-gray-100">
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-16">
        <button onClick={() => setScreen("home")} className="shrink-0">
          <img src="/logo-saojoao.png" alt="Farmácias São João" className="h-10 object-contain" />
        </button>
        <div className="flex items-center gap-2 text-sj-green text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />Compra 100% Segura
        </div>
      </div>
    </header>
  );
}
