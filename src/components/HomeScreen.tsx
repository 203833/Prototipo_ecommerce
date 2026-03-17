import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  Truck,
  Clock,
  Store,
  CreditCard,
} from "lucide-react";
import { PRODUCTS, CATEGORY_LABELS, CATEGORY_ICONS, type ProductCategory } from "../data/products";
import { useApp } from "../context/AppContext";
import SJHeader from "./SJHeader";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

const BANNERS = [
  {
    bg: "from-[#0054A6] to-[#003D7A]",
    headline: "R$ 12",
    headlineSuffix: "OFF",
    sub: "EM COMPRAS ACIMA DE R$199,90",
    coupon: "OBACUPOM",
    badge: "R$ 18 OFF acima de R$299,90",
  },
  {
    bg: "from-sj-green to-emerald-700",
    headline: "Frete",
    headlineSuffix: "GRÁTIS",
    sub: "Em compras acima de R$149,90",
    coupon: null,
    badge: "Consulte condições",
  },
  {
    bg: "from-sj-red to-rose-700",
    headline: "Leve 4",
    headlineSuffix: "Pague 3",
    sub: "Fraldas e Higiene selecionadas",
    coupon: null,
    badge: "Válido até acabar o estoque",
  },
];

const BENEFITS = [
  { icon: Truck, title: "Entrega Grátis", sub: "Consulte condições" },
  { icon: Clock, title: "Entrega rápida", sub: "Em até 1h" },
  { icon: Store, title: "Retire na loja", sub: "Em até 30 minutos" },
  { icon: CreditCard, title: "Pague Fácil", sub: "Com PIX" },
];

const CATEGORY_IMAGES: Record<ProductCategory, string> = {
  medicamentos: "💊",
  medicamentos_especiais: "💉",
  infantil: "👶",
  dermocosmeticos: "✨",
  higiene: "🧴",
  vitaminas: "🍊",
};

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function discountPercent(orig: number, sale: number) {
  return Math.round(((orig - sale) / orig) * 100);
}

export default function HomeScreen() {
  const { searchQuery, selectedCategory, setSelectedCategory, addToCart, cart, setScreen } = useApp();
  const [bannerIdx, setBannerIdx] = useState(0);

  const filteredProducts = useMemo(() => {
    let list = PRODUCTS;
    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const getCartQty = (productId: string) =>
    cart.find((i) => i.product.id === productId)?.quantity ?? 0;

  const banner = BANNERS[bannerIdx];

  function prevBanner() {
    setBannerIdx((i) => (i === 0 ? BANNERS.length - 1 : i - 1));
  }
  function nextBanner() {
    setBannerIdx((i) => (i === BANNERS.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="flex flex-col bg-[#F5F5F5] min-h-screen">
      <SJHeader />

      <div className="max-w-[1200px] mx-auto w-full px-6">
        {/* Banner carousel */}
        <div className="mt-5 mb-5 relative">
          <div className={`bg-gradient-to-r ${banner.bg} rounded-2xl p-10 relative overflow-hidden min-h-[200px]`}>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute right-0 bottom-0 w-72 h-72 bg-white rounded-full -mr-24 -mb-24" />
              <div className="absolute right-40 top-0 w-48 h-48 bg-white rounded-full -mt-20" />
            </div>
            <div className="relative z-10 max-w-lg">
              <div className="flex items-baseline gap-3">
                <span className="text-white text-6xl font-black leading-none">{banner.headline}</span>
                <span className="text-sj-yellow text-4xl font-black">{banner.headlineSuffix}</span>
              </div>
              <p className="text-white/90 text-sm font-semibold mt-3 uppercase tracking-wider">{banner.sub}</p>
              {banner.coupon && (
                <div className="mt-4 inline-flex items-center bg-sj-yellow rounded-lg px-4 py-2">
                  <span className="text-xs font-bold text-sj-navy mr-2">CUPOM</span>
                  <span className="text-sm font-black text-sj-navy tracking-wide">{banner.coupon}</span>
                </div>
              )}
              {!banner.coupon && banner.badge && (
                <p className="text-white/60 text-xs mt-3 font-medium">{banner.badge}</p>
              )}
            </div>
          </div>

          <button
            onClick={prevBanner}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-sj-gray-600 hover:bg-white transition z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-sj-gray-600 hover:bg-white transition z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="flex gap-1.5 justify-center mt-3">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === bannerIdx ? "w-8 bg-sj-blue" : "w-2.5 bg-sj-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Benefits strip */}
        <div className="bg-white rounded-xl shadow-sm border border-sj-gray-100 mb-8">
          <div className="flex">
            {BENEFITS.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className={`flex-1 flex items-center justify-center gap-3 px-4 py-5 ${
                    i < BENEFITS.length - 1 ? "border-r border-sj-gray-100" : ""
                  }`}
                >
                  <Icon className="h-7 w-7 text-sj-blue shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-bold text-sj-navy">{b.title}</p>
                    <p className="text-xs text-sj-gray-500">{b.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories — circular icons */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-sj-navy" />
            <div className="flex gap-2">
              <button className="h-8 w-8 rounded-full border border-sj-gray-200 flex items-center justify-center text-sj-gray-500 hover:bg-sj-gray-50 transition">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-8 w-8 rounded-full border border-sj-gray-200 flex items-center justify-center text-sj-gray-500 hover:bg-sj-gray-50 transition">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-6 justify-center mt-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isActive ? null : cat)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className={`h-24 w-24 rounded-full flex items-center justify-center text-4xl transition-all ${
                      isActive
                        ? "bg-sj-blue/10 ring-3 ring-sj-blue shadow-md"
                        : "bg-sj-gray-100 group-hover:bg-sj-gray-200"
                    }`}
                  >
                    {CATEGORY_IMAGES[cat]}
                  </div>
                  <span
                    className={`text-xs font-semibold text-center leading-tight max-w-[90px] ${
                      isActive ? "text-sj-blue" : "text-sj-gray-600"
                    }`}
                  >
                    {CATEGORY_LABELS[cat]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Products grid */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-sj-navy mb-4">
            {selectedCategory ? CATEGORY_LABELS[selectedCategory] : searchQuery ? "Resultados" : "Mais vendidos"}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => {
              const inCart = getCartQty(product.id);
              const hasDiscount = product.originalPrice !== null;
              const pct = hasDiscount ? discountPercent(product.originalPrice!, product.price) : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-sj-gray-100 overflow-hidden hover:shadow-lg transition group"
                >
                  <div className="h-40 bg-sj-gray-50 flex items-center justify-center text-5xl relative">
                    {product.imageEmoji}
                    {product.requiresPrescription && (
                      <div className="absolute top-2 left-2 bg-sj-blue text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <ShieldCheck className="h-3 w-3" />
                        RECEITA
                      </div>
                    )}
                    {hasDiscount && (
                      <span className="absolute top-2 right-2 bg-sj-red text-white text-[10px] font-bold px-2 py-1 rounded-md">
                        -{pct}%
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-medium text-sj-navy leading-snug line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    <div className="mt-2.5">
                      {hasDiscount && (
                        <span className="text-xs text-sj-gray-400 line-through block">{money(product.originalPrice!)}</span>
                      )}
                      <p className="text-xl font-extrabold text-sj-navy">{money(product.price)}</p>
                      {product.price > 20 && (
                        <p className="text-[11px] text-sj-gray-500 mt-0.5">ou 2x de {money(product.price / 2)} sem juros</p>
                      )}
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      className={`mt-3 w-full h-10 rounded-lg flex items-center justify-center gap-1.5 transition text-sm font-bold ${
                        inCart > 0
                          ? "bg-sj-blue text-white hover:bg-sj-blue-dark"
                          : "bg-sj-blue text-white hover:bg-sj-blue-dark"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      {inCart > 0 ? `No carrinho (${inCart})` : "Adicionar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20 text-sj-gray-400">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-lg font-medium">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
