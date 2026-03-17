import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PRODUCTS } from "../data/products";
import SJHeader from "./SJHeader";

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const BEST_SELLERS = PRODUCTS.filter((p) => p.originalPrice !== null).slice(0, 6);

export default function CartScreen() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, setScreen, addToCart } = useApp();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col bg-white min-h-screen">
        <SJHeader />
        <div className="max-w-[1100px] mx-auto w-full px-6 py-8">
          <h1 className="text-2xl font-bold text-sj-navy mb-6">Carrinho ({cartCount})</h1>

          <div className="flex flex-col items-center justify-center py-16 bg-sj-gray-50 rounded-xl">
            <ShoppingBag className="h-16 w-16 text-sj-gray-300 mb-4" />
            <h2 className="text-lg font-bold text-sj-blue">Seu carrinho está vazio</h2>
            <p className="text-sm text-sj-gray-500 mt-1.5 text-center max-w-md">
              Navegue pelo site ou faça uma busca para encontrar seus produtos
            </p>
            <button
              onClick={() => setScreen("home")}
              className="mt-5 h-11 px-8 rounded-lg bg-sj-navy text-white font-bold hover:bg-sj-navy-light transition"
            >
              Escolher produtos
            </button>
          </div>

          <div className="mt-10">
            <h2 className="text-lg font-bold text-sj-navy mb-4">Mais vendidos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {BEST_SELLERS.map((product) => {
                const pct = product.originalPrice
                  ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                  : 0;
                return (
                  <div key={product.id} className="bg-white rounded-xl border border-sj-gray-200 overflow-hidden">
                    <div className="h-32 bg-sj-gray-50 flex items-center justify-center text-4xl relative">
                      {product.imageEmoji}
                      {product.requiresPrescription && (
                        <div className="absolute top-2 left-2 bg-sj-blue text-white text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ShieldCheck className="h-3 w-3" />
                          RECEITA
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-xs font-medium text-sj-navy leading-tight line-clamp-2 h-8">{product.name}</h3>
                      <div className="mt-2">
                        {product.originalPrice && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-sj-gray-400 line-through">{money(product.originalPrice)}</span>
                            <span className="bg-sj-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{pct}%</span>
                          </div>
                        )}
                        <p className="text-sm font-extrabold text-sj-navy mt-0.5">{money(product.price)}</p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-2 w-full h-8 rounded bg-sj-blue-light text-sj-blue text-xs font-bold hover:bg-sj-blue-100 transition flex items-center justify-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Adicionar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#F5F5F5] min-h-screen">
      <SJHeader />
      <div className="max-w-[1100px] mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-bold text-sj-navy mb-6">Carrinho ({cartCount})</h1>

        <div className="flex gap-8">
          <div className="flex-1">
            <div className="bg-white rounded-lg border border-sj-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sj-gray-200 text-xs text-sj-gray-500 uppercase tracking-wider">
                    <th className="text-left py-3 px-5 font-semibold">Produto</th>
                    <th className="text-center py-3 px-2 font-semibold w-24">Preço</th>
                    <th className="text-center py-3 px-2 font-semibold w-32">Quantidade</th>
                    <th className="text-center py-3 px-2 font-semibold w-24">Total</th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.product.id} className="border-b border-sj-gray-100 last:border-0">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-lg bg-sj-gray-50 flex items-center justify-center text-3xl shrink-0">
                            {item.product.imageEmoji}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-sj-navy">{item.product.name}</p>
                            <p className="text-xs text-sj-gray-500 mt-0.5">{item.product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-2">
                        <span className="text-sm font-medium text-sj-navy">{money(item.product.price)}</span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="h-8 w-8 rounded border border-sj-gray-200 flex items-center justify-center text-sj-gray-500 hover:bg-sj-gray-50 transition"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-sm font-bold text-sj-navy w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="h-8 w-8 rounded border border-sj-gray-200 flex items-center justify-center text-sj-blue hover:bg-sj-blue-light transition"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="text-center py-4 px-2">
                        <span className="text-sm font-bold text-sj-navy">{money(item.product.price * item.quantity)}</span>
                      </td>
                      <td className="py-4 px-2">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-sj-gray-400 hover:text-sj-red transition p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="w-80 shrink-0">
            <div className="bg-white rounded-lg border border-sj-gray-200 p-6 shadow-sm sticky top-6">
              <h3 className="text-lg font-bold text-sj-navy mb-4">Resumo do pedido</h3>

              <div className="flex justify-between text-sm text-sj-gray-600 mb-2">
                <span>Subtotal ({cartCount} {cartCount === 1 ? "item" : "itens"})</span>
                <span className="font-semibold text-sj-navy">{money(cartTotal)}</span>
              </div>

              <div className="flex justify-between text-sm text-sj-gray-600 mb-4">
                <span>Frete</span>
                <span className="text-sj-gray-400 text-xs">Calcule no checkout</span>
              </div>

              <div className="border-t border-sj-gray-200 pt-4 mb-5">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-sj-navy">Total</span>
                  <span className="text-lg font-extrabold text-sj-navy">{money(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => setScreen("checkout")}
                className="w-full h-12 rounded-lg bg-sj-blue text-white font-bold hover:bg-sj-blue-dark transition flex items-center justify-center gap-2"
              >
                Calcular Entrega
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
