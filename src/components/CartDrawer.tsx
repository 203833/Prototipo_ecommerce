import { X, Minus, Plus, Trash2, Truck, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const FREE_SHIPPING_THRESHOLD = 149.9;
const FAST_SHIPPING_THRESHOLD = 299.9;

export default function CartDrawer() {
  const {
    cartDrawerOpen,
    setCartDrawerOpen,
    cart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
    setScreen,
  } = useApp();

  if (!cartDrawerOpen) return null;

  const freeShippingProgress = Math.min((cartTotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const freeShippingRemaining = Math.max(FREE_SHIPPING_THRESHOLD - cartTotal, 0);
  const fastShippingProgress = Math.min((cartTotal / FAST_SHIPPING_THRESHOLD) * 100, 100);
  const fastShippingRemaining = Math.max(FAST_SHIPPING_THRESHOLD - cartTotal, 0);

  function handleFinalize() {
    setCartDrawerOpen(false);
    setScreen("cart");
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={() => setCartDrawerOpen(false)}
      />

      <div className="fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sj-gray-100">
          <h2 className="text-lg font-bold text-sj-blue">Minha cesta</h2>
          <button
            onClick={() => setCartDrawerOpen(false)}
            className="h-8 w-8 rounded-full flex items-center justify-center text-sj-gray-500 hover:bg-sj-gray-50 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <p className="text-5xl mb-3">🛒</p>
              <p className="text-sm font-bold text-sj-navy">Sua cesta está vazia</p>
              <p className="text-xs text-sj-gray-500 mt-1">Adicione produtos para continuar</p>
            </div>
          ) : (
            <div className="divide-y divide-sj-gray-100">
              {cart.map((item) => (
                <div key={item.product.id} className="px-5 py-4 flex gap-3">
                  <div className="h-16 w-16 rounded-lg bg-sj-gray-50 flex items-center justify-center text-3xl shrink-0">
                    {item.product.imageEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-sj-navy leading-snug line-clamp-2">{item.product.name}</p>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-sj-gray-400 hover:text-sj-red transition shrink-0 p-0.5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-sj-navy mt-1">{money(item.product.price)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="h-7 w-7 rounded bg-sj-blue flex items-center justify-center text-white hover:bg-sj-blue-dark transition"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-bold text-sj-navy w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="h-7 w-7 rounded bg-sj-blue flex items-center justify-center text-white hover:bg-sj-blue-dark transition"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-sj-gray-200 px-5 py-4 bg-white">
            <div className="flex justify-between text-sm text-sj-gray-600 mb-1">
              <span>Subtotal:</span>
              <span className="font-medium text-sj-navy">{money(cartTotal)}</span>
            </div>
            <div className="flex justify-between items-baseline mb-4">
              <span className="text-base font-bold text-sj-navy">Total da compra:</span>
              <span className="text-xl font-extrabold text-sj-navy">{money(cartTotal)}</span>
            </div>

            {/* Free shipping progress */}
            <div className="mb-2">
              <p className="text-xs text-sj-gray-600 mb-1.5">
                {freeShippingRemaining > 0 ? (
                  <>Faltam <strong className="text-sj-green">{money(freeShippingRemaining)}</strong> para o <strong>FRETE GRÁTIS</strong></>
                ) : (
                  <strong className="text-sj-green">Frete grátis!</strong>
                )}
              </p>
              <div className="h-2 bg-sj-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-sj-green rounded-full transition-all" style={{ width: `${freeShippingProgress}%` }} />
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-sj-gray-600 mb-1.5">
                {fastShippingRemaining > 0 ? (
                  <>Faltam <strong className="text-sj-blue">{money(fastShippingRemaining)}</strong> para o <strong>FRETE GRÁTIS</strong> com <strong>ENTREGA RÁPIDA</strong></>
                ) : (
                  <strong className="text-sj-blue">Frete grátis com entrega rápida!</strong>
                )}
              </p>
              <div className="h-2 bg-sj-gray-100 rounded-full overflow-hidden relative">
                <div className="h-full bg-sj-blue rounded-full transition-all" style={{ width: `${fastShippingProgress}%` }} />
              </div>
              <div className="flex justify-between mt-1">
                <Truck className="h-3.5 w-3.5 text-sj-green" />
                <Zap className="h-3.5 w-3.5 text-sj-blue" />
              </div>
            </div>

            {/* Cashback */}
            <div className="flex items-center justify-between bg-sj-gray-50 rounded-lg px-3 py-2.5 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-sj-green/10 flex items-center justify-center">
                  <span className="text-sm">💰</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-sj-navy">Cashback acumulado</p>
                  <p className="text-[10px] text-sj-gray-500">para próxima compra</p>
                </div>
              </div>
              <span className="text-sm font-bold text-sj-green">+{money(cartTotal * 0.03)}</span>
            </div>

            <button
              onClick={handleFinalize}
              className="w-full h-12 rounded-lg bg-sj-blue text-white font-bold text-sm hover:bg-sj-blue-dark transition"
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
}
