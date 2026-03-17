import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Package,
  Bike,
  Building2,
  MapPin,
  Clock,
  Zap,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  BarChart3,
  TrendingUp,
  Timer,
  Percent,
  Store,
  Home,
  ShoppingBag,
  Copy,
  Star,
} from "lucide-react";
import { useApp, type ConfirmedOrder } from "../context/AppContext";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function TrackingTimeline({ order }: { order: ConfirmedOrder }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setActiveStep(1), 1200),
      setTimeout(() => setActiveStep(2), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = useMemo(() => {
    const s = [
      {
        icon: CheckCircle2,
        label: "Pedido confirmado",
        detail: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        color: "text-sj-green",
        bgColor: "bg-sj-green",
      },
      {
        icon: Store,
        label: "Preparando na filial",
        detail: order.plan.nearestStore.name,
        color: "text-sj-blue",
        bgColor: "bg-sj-blue",
      },
      {
        icon: Bike,
        label: order.storeMode === "retirada"
          ? "Pronto para retirada"
          : order.storeMode === "rapida"
            ? "Motoboy a caminho"
            : "Agendado para entrega",
        detail:
          order.storeMode === "retirada"
            ? "Retire em até 30 minutos"
            : order.storeMode === "rapida"
              ? `~${order.plan.storePackage?.deliveryModes.rapida.estimatedMinutes ?? 45} min`
              : order.storeSchedule
                ? `${order.storeSchedule.date.split("-").reverse().slice(0, 2).join("/")} às ${order.storeSchedule.slot}`
                : "",
        color: "text-sj-orange",
        bgColor: "bg-sj-orange",
      },
    ];
    return s;
  }, [order]);

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const isActive = i <= activeStep;
        const Icon = step.icon;
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isActive ? `${step.bgColor} text-white shadow-md` : "bg-sj-gray-100 text-sj-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-10 transition-colors duration-500 ${
                    i < activeStep ? "bg-sj-green" : "bg-sj-gray-200"
                  }`}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={`text-xs font-bold transition-colors duration-500 ${
                  isActive ? "text-sj-navy" : "text-sj-gray-300"
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-[10px] transition-colors duration-500 ${
                  isActive ? "text-sj-gray-500" : "text-sj-gray-300"
                }`}
              >
                {step.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CDTrackingTimeline({ order }: { order: ConfirmedOrder }) {
  if (!order.plan.cdPackage) return null;

  const pkg = order.plan.cdPackage;
  const schedLabel = order.cdSchedule
    ? `${order.cdSchedule.date.split("-").reverse().slice(0, 2).join("/")} às ${order.cdSchedule.slot}`
    : "";

  const steps = [
    { icon: Package, label: "Pedido em separação", detail: "Preparando seus produtos", color: "bg-sj-gray-500" },
    { icon: Store, label: "Em trânsito para filial", detail: `Previsão: ${pkg.transitDaysToStore} dia(s)`, color: "bg-sj-blue" },
    { icon: Store, label: "Pronto na filial", detail: pkg.lastMileStore.name, color: "bg-sj-navy" },
    { icon: Bike, label: "Saiu para entrega", detail: schedLabel, color: "bg-sj-orange" },
  ];

  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center ${step.color} text-white`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              {i < steps.length - 1 && <div className="w-0.5 h-8 bg-sj-gray-200" />}
            </div>
            <div className="pt-0.5">
              <p className="text-[11px] font-bold text-sj-navy">{step.label}</p>
              <p className="text-[10px] text-sj-gray-500">{step.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`bg-white rounded-xl border border-sj-gray-200 p-3 flex flex-col gap-1.5 transition-all duration-700 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <span className="text-[9px] font-bold text-sj-gray-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-xl font-extrabold ${color}`}>{value}</p>
      <p className="text-[9px] text-sj-gray-400">{sub}</p>
    </div>
  );
}

function BusinessDashboard({ order }: { order: ConfirmedOrder }) {
  const [expanded, setExpanded] = useState(false);

  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
  const storeItems = order.plan.storePackage?.items.reduce((s, i) => s + i.fulfilledQty, 0) ?? 0;
  const otherStoreItems = (order.remainingSource === "otherStore" && order.plan.otherStorePackage)
    ? order.plan.otherStorePackage.items.reduce((s, i) => s + i.fulfilledQty, 0)
    : 0;
  const allStoreItems = storeItems + otherStoreItems;
  const fulfillmentRate = totalItems > 0 ? Math.round((allStoreItems / totalItems) * 100) : 0;

  const avgDeliveryMin = order.plan.storePackage?.deliveryModes.rapida.estimatedMinutes ?? 0;
  const savedVsCD = order.plan.cdPackage
    ? Math.round((allStoreItems / totalItems) * 100)
    : 100;

  const freightSaved = order.plan.storePackage
    ? Math.max(0, 14.9 - order.plan.storePackage.deliveryModes.rapida.shippingCost)
    : 0;

  return (
    <div className="bg-gradient-to-br from-sj-navy to-sj-navy-light rounded-xl overflow-hidden shadow-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-white">Promise Engine — Métricas</h3>
            <p className="text-[10px] text-white/50">Indicadores deste pedido</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-white/50" />
        ) : (
          <ChevronDown className="h-4 w-4 text-white/50" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              icon={Percent}
              label="Fulfillment na filial"
              value={`${fulfillmentRate}%`}
              sub={`${storeItems} de ${totalItems} itens da loja`}
              color="text-sj-green"
            />
            <MetricCard
              icon={Timer}
              label="Tempo entrega rápida"
              value={avgDeliveryMin > 0 ? `${avgDeliveryMin}min` : "N/A"}
              sub="Estimativa motoboy"
              color="text-sj-orange"
            />
            <MetricCard
              icon={TrendingUp}
              label="Itens sem split CD"
              value={`${savedVsCD}%`}
              sub="Entregues sem depender do CD"
              color="text-sj-blue"
            />
            <MetricCard
              icon={BarChart3}
              label="Economia de frete"
              value={freightSaved > 0 ? money(freightSaved) : "—"}
              sub="vs. envio total pelo CD"
              color="text-sj-red"
            />
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-2">
              Decisão do motor
            </p>
            <div className="flex flex-col gap-1.5 text-[10px] text-white/60">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-sj-green" />
                <span>Filial mais próxima: <strong className="text-white">{order.plan.nearestStore.name}</strong> ({order.plan.nearestStore.distanceKm.toFixed(1)} km)</span>
              </div>
              {order.plan.storePackage && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-sj-green" />
                  <span>Pacote Filial: <strong className="text-white">{order.plan.storePackage.items.length} itens</strong> disponíveis</span>
                </div>
              )}
              {order.plan.otherStorePackage && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-sj-blue" />
                  <span>Outra filial ({order.plan.otherStorePackage.store.name}): <strong className="text-white">{order.plan.otherStorePackage.items.length} itens</strong> — {order.plan.otherStorePackage.store.distanceKm.toFixed(1)} km</span>
                </div>
              )}
              {order.plan.cdPackage && (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Pacote CD: <strong className="text-white">{order.plan.cdPackage.items.length} itens</strong> — trânsito {order.plan.cdPackage.transitDaysToStore}d até filial</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-sj-blue" />
                <span>Custo total frete: <strong className="text-white">{money(order.totalShipping)}</strong></span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider mb-2">
              Visão para o negócio
            </p>
            <div className="flex flex-col gap-1.5 text-[10px] text-white/60">
              <p>
                <Star className="h-3 w-3 text-amber-400 inline mr-1" />
                Ao enviar da filial próxima, o cliente recebe em <strong className="text-white">{avgDeliveryMin}min</strong> vs <strong className="text-white">3+ dias</strong> se fosse somente CD.
              </p>
              <p>
                <Star className="h-3 w-3 text-amber-400 inline mr-1" />
                O split delivery garante que <strong className="text-white">{fulfillmentRate}%</strong> do pedido é atendido por filiais, aumentando satisfação e reduzindo cancelamentos.
              </p>
              {order.plan.otherStorePackage && (
                <p>
                  <Star className="h-3 w-3 text-amber-400 inline mr-1" />
                  A filial <strong className="text-white">{order.plan.otherStorePackage.store.name}</strong> foi acionada para cobrir itens indisponíveis na loja mais próxima, evitando depender do CD.
                </p>
              )}
              <p>
                <Star className="h-3 w-3 text-amber-400 inline mr-1" />
                O motor escolheu automaticamente a melhor combinação de filiais {order.plan.cdPackage ? "+ CD " : ""}sem intervenção manual.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderConfirmationScreen() {
  const { confirmedOrder, setScreen, clearCart, setConfirmedOrder } = useApp();
  const [showCheck, setShowCheck] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowCheck(true), 200);
    setTimeout(() => setShowContent(true), 800);
  }, []);

  if (!confirmedOrder) return null;

  const order = confirmedOrder;

  function handleNewOrder() {
    clearCart();
    setConfirmedOrder(null);
    setScreen("home");
  }

  function copyOrderId() {
    navigator.clipboard.writeText(order.orderId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-0 pb-6">
      {/* Animated success header */}
      <div className="bg-gradient-to-b from-sj-green to-emerald-600 px-4 pt-12 pb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${8 + Math.random() * 16}px`,
                height: `${8 + Math.random() * 16}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div
          className={`mx-auto h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-700 ${
            showCheck ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <div
            className={`h-14 w-14 rounded-full bg-white flex items-center justify-center transition-all duration-500 delay-300 ${
              showCheck ? "scale-100" : "scale-0"
            }`}
          >
            <CheckCircle2 className="h-8 w-8 text-sj-green" />
          </div>
        </div>

        <h1
          className={`text-white text-xl font-extrabold mt-4 transition-all duration-500 ${
            showCheck ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Pedido Confirmado!
        </h1>
        <p
          className={`text-white/70 text-sm mt-1 transition-all duration-500 delay-200 ${
            showCheck ? "opacity-100" : "opacity-0"
          }`}
        >
          Tudo certo com seu pedido
        </p>
      </div>

      <div
        className={`p-4 flex flex-col gap-3 transition-all duration-700 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Order ID card */}
        <div className="bg-white rounded-xl border border-sj-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-sj-gray-500 uppercase tracking-wider">
                Número do pedido
              </p>
              <p className="text-lg font-extrabold text-sj-navy mt-0.5 tracking-wide">
                {order.orderId}
              </p>
            </div>
            <button
              onClick={copyOrderId}
              className="h-9 px-3 rounded-lg bg-sj-gray-50 border border-sj-gray-200 text-sj-gray-500 text-[10px] font-bold flex items-center gap-1.5 hover:bg-sj-gray-100 transition"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copiado!" : "Copiar"}
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-sj-gray-100 grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[9px] text-sj-gray-400 font-medium">Produtos</p>
              <p className="text-sm font-bold text-sj-navy">{money(order.totalProducts)}</p>
            </div>
            <div>
              <p className="text-[9px] text-sj-gray-400 font-medium">Frete</p>
              <p className={`text-sm font-bold ${order.totalShipping === 0 ? "text-sj-green" : "text-sj-navy"}`}>
                {order.totalShipping === 0 ? "Grátis" : money(order.totalShipping)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-sj-gray-400 font-medium">Total</p>
              <p className="text-sm font-extrabold text-sj-red">{money(order.totalFinal)}</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-sj-gray-100 flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-sj-gray-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-sj-gray-600">
              {order.customer.street ? `${order.customer.street}, ` : ""}
              {order.customer.district ? `${order.customer.district} - ` : ""}
              <strong>{order.customer.city}/{order.customer.state}</strong>
            </p>
          </div>
        </div>

        {/* SPLIT delivery packages */}
        {order.deliveryOption === "split" && order.plan.storePackage && (
          <div className="bg-white rounded-xl border border-sj-gray-200 overflow-hidden shadow-sm">
            <div className="bg-sj-green-light px-4 py-3 flex items-center gap-2.5 border-b border-sj-green/10">
              <div className="h-8 w-8 rounded-lg bg-sj-green/10 flex items-center justify-center">
                {order.storeMode === "retirada" ? (
                  <Store className="h-4 w-4 text-sj-green" />
                ) : order.storeMode === "rapida" ? (
                  <Zap className="h-4 w-4 text-sj-orange" />
                ) : (
                  <CalendarDays className="h-4 w-4 text-sj-blue" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-sj-navy">
                  Pacote 1 — {order.storeMode === "retirada" ? "Retirada em Loja" : order.storeMode === "rapida" ? "Entrega Rápida" : "Programada"}
                </h3>
                <p className="text-[10px] text-sj-gray-500 mt-0.5">
                  {order.plan.storePackage.items.length} {order.plan.storePackage.items.length === 1 ? "item" : "itens"} da {order.plan.nearestStore.name}
                </p>
              </div>
              {order.storeMode === "retirada" && (
                <span className="bg-sj-green/10 text-sj-green text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                  <Store className="h-3 w-3" />Grátis
                </span>
              )}
              {order.storeMode === "rapida" && (
                <span className="bg-sj-orange/10 text-sj-orange text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{order.plan.storePackage.deliveryModes.rapida.estimatedMinutes}min
                </span>
              )}
            </div>

            <div className="p-4">
              <TrackingTimeline order={order} />

              <div className="mt-4 flex flex-col gap-1">
                {order.plan.storePackage.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-2 text-[11px] bg-sj-gray-50 rounded-lg px-2.5 py-2"
                  >
                    <span className="text-sm">{item.product.imageEmoji}</span>
                    <span className="flex-1 truncate font-medium text-sj-navy">{item.product.name}</span>
                    <span className="text-sj-gray-400">x{item.fulfilledQty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pacote 2 — Outra filial envia o que a mais próxima não tem */}
        {order.deliveryOption === "split" && order.remainingSource === "otherStore" && order.plan.otherStorePackage && (() => {
          const osPkg = order.plan.otherStorePackage!;
          const sched = order.otherStoreSchedules[osPkg.store.code];
          const isRapida = order.pkg2Mode === "rapida";
          return (
            <div className="bg-white rounded-xl border border-sj-gray-200 overflow-hidden shadow-sm">
              <div className="bg-blue-50 px-4 py-3 flex items-center gap-2.5 border-b border-blue-200/50">
                <div className="h-8 w-8 rounded-lg bg-sj-blue/10 flex items-center justify-center">
                  {isRapida ? <Zap className="h-4 w-4 text-sj-orange" /> : <Store className="h-4 w-4 text-sj-blue" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-sj-navy">
                    Pacote 2 — {isRapida ? "Entrega Rápida" : "Programada"} — Filial {osPkg.store.name}
                  </h3>
                  <p className="text-[10px] text-sj-gray-500 mt-0.5">
                    {osPkg.items.length} {osPkg.items.length === 1 ? "item" : "itens"} &middot; {osPkg.store.distanceKm.toFixed(1)} km
                    {isRapida
                      ? ` · ~${osPkg.deliveryModes.rapida.estimatedMinutes}min`
                      : sched ? ` · Previsão ${sched.date.split("-").reverse().slice(0, 2).join("/")}` : " · Agendado"}
                  </p>
                </div>
                {isRapida ? (
                  <span className="bg-sj-orange/10 text-sj-orange text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <Clock className="h-3 w-3" />~{osPkg.deliveryModes.rapida.estimatedMinutes}min
                  </span>
                ) : (
                  <span className="bg-sj-blue/10 text-sj-blue text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />Programada
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-1">
                {osPkg.items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 text-[11px] bg-sj-gray-50 rounded-lg px-2.5 py-2">
                    <span className="text-sm">{item.product.imageEmoji}</span>
                    <span className="flex-1 truncate font-medium text-sj-navy">{item.product.name}</span>
                    <span className="text-sj-gray-400">x{item.fulfilledQty}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Pacote 3 — CD envia para a filial mais próxima, ela entrega */}
        {order.deliveryOption === "split" && order.remainingSource === "cd" && order.plan.cdPackage && (
          <div className="bg-white rounded-xl border border-sj-gray-200 overflow-hidden shadow-sm">
            <div className="bg-sj-gray-50 px-4 py-3 flex items-center gap-2.5 border-b border-sj-gray-200">
              <div className="h-8 w-8 rounded-lg bg-sj-gray-200 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-sj-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-sj-navy">
                  Pacote {(order.plan.storePackage ? 1 : 0) + 1} — Entrega Programada
                </h3>
                <p className="text-[10px] text-sj-gray-500 mt-0.5">
                  {order.plan.cdPackage.items.length} {order.plan.cdPackage.items.length === 1 ? "item" : "itens"} &middot; Previsão{" "}
                  {order.cdSchedule
                    ? order.cdSchedule.date.split("-").reverse().slice(0, 2).join("/")
                    : `${order.plan.cdPackage.transitDaysToStore}+ dias`}
                </p>
              </div>
              <span className="bg-sj-blue/10 text-sj-blue text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Agendado
              </span>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <CDTrackingTimeline order={order} />

              <div className="flex flex-col gap-1">
                {order.plan.cdPackage.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-2 text-[11px] bg-sj-gray-50 rounded-lg px-2.5 py-2"
                  >
                    <span className="text-sm">{item.product.imageEmoji}</span>
                    <span className="flex-1 truncate font-medium text-sj-navy">{item.product.name}</span>
                    <span className="text-sj-gray-400">x{item.fulfilledQty}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pacote 4 — Pedido completo via CD */}
        {order.deliveryOption === "full" && (
          <div className="bg-white rounded-xl border border-sj-gray-200 overflow-hidden shadow-sm">
            <div className="bg-amber-50 px-4 py-3 flex items-center gap-2.5 border-b border-amber-200/50">
              <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-sj-navy">Pedido Completo — Entrega Programada</h3>
                <p className="text-[10px] text-sj-gray-500 mt-0.5">
                  {order.plan.fullOrderPackage.items.length} {order.plan.fullOrderPackage.items.length === 1 ? "item" : "itens"} &middot; Previsão{" "}
                  {order.fullSchedule
                    ? order.fullSchedule.date.split("-").reverse().slice(0, 2).join("/")
                    : `${order.plan.fullOrderPackage.transitDaysToStore}+ dias`}
                </p>
              </div>
              <span className="bg-sj-blue/10 text-sj-blue text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />Programada
              </span>
            </div>

            <div className="p-4 flex flex-col gap-1">
              {order.plan.fullOrderPackage.items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-2 text-[11px] bg-sj-gray-50 rounded-lg px-2.5 py-2">
                  <span className="text-sm">{item.product.imageEmoji}</span>
                  <span className="flex-1 truncate font-medium text-sj-navy">{item.product.name}</span>
                  <span className="text-sj-gray-400">x{item.fulfilledQty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Business Dashboard */}
        <BusinessDashboard order={order} />

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-1">
          <button
            onClick={handleNewOrder}
            className="w-full h-12 rounded-xl bg-sj-blue text-white text-sm font-bold hover:bg-sj-blue-dark transition flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Fazer novo pedido
          </button>
          <button
            onClick={() => setScreen("home")}
            className="w-full h-11 rounded-xl bg-sj-gray-50 border border-sj-gray-200 text-sj-navy text-sm font-semibold hover:bg-sj-gray-100 transition flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
