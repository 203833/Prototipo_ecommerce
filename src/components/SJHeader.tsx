import { Search, User, ShoppingCart, MapPin, Menu } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function SJHeader({ showSearch = true }: { showSearch?: boolean }) {
  const { searchQuery, setSearchQuery, setScreen, cartCount, cartTotal, customer, setCartDrawerOpen } = useApp();

  function money(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return (
    <header className="w-full bg-white shadow-sm">
      {/* Top bar */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center gap-6 h-[72px]">
          <button onClick={() => setScreen("home")} className="shrink-0">
            <img
              src="/logo-saojoao.png"
              alt="Farmácias São João"
              className="h-12 object-contain"
            />
          </button>

          {showSearch && (
            <div className="flex-1 relative max-w-[520px]">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O que você está buscando?"
                className="w-full h-11 rounded-lg border border-sj-gray-300 pl-4 pr-12 text-sm text-sj-navy placeholder:text-sj-gray-400 outline-none focus:border-sj-blue transition"
              />
              <button className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center bg-sj-blue rounded-r-lg hover:bg-sj-blue-dark transition">
                <Search className="h-4 w-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-5 ml-auto shrink-0">
            <button className="flex items-center gap-2 text-sj-green hover:opacity-80 transition">
              <div className="h-8 w-8 rounded-full bg-sj-green/10 flex items-center justify-center">
                <span className="text-sm">💰</span>
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-sj-navy">Seu Cashback</p>
                <p className="text-xs font-bold text-sj-green">R$ 0,00</p>
              </div>
            </button>

            <button onClick={() => setScreen("conta")} className="flex items-center gap-2 text-sj-gray-600 hover:text-sj-navy transition">
              <User className="h-5 w-5" />
              <div className="text-left hidden lg:block">
                <p className="text-xs text-sj-gray-500">Olá,</p>
                <p className="text-xs font-semibold text-sj-navy">Entre ou cadastre-se</p>
              </div>
            </button>

            <button
              onClick={() => setCartDrawerOpen(true)}
              className="flex items-center gap-2 text-sj-gray-600 hover:text-sj-navy transition relative"
            >
              <div className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-sj-red text-white text-[10px] font-black rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              {cartCount > 0 && (
                <span className="text-xs font-bold text-sj-navy hidden lg:block">{money(cartTotal)}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div className="bg-sj-blue">
        <div className="max-w-[1200px] mx-auto px-6">
          <nav className="flex items-center gap-0 h-10 text-sm">
            <button className="flex items-center gap-1.5 text-white/90 hover:text-white transition px-3 h-full border-r border-white/15">
              <MapPin className="h-3.5 w-3.5" />
              <span className="font-medium">
                {customer?.cep || "Informe CEP"}
              </span>
              <span className="text-white/60 text-xs ml-0.5">Alterar</span>
            </button>

            <button
              onClick={() => setScreen("categories")}
              className="flex items-center gap-1.5 text-white hover:bg-white/10 transition px-4 h-full font-bold"
            >
              <Menu className="h-4 w-4" />
              Departamentos
            </button>

            {[
              { id: "cupons" as const, label: "Cupons" },
              { id: "home" as const, label: "Serviços de Saúde" },
              { id: "home" as const, label: "Nossas marcas" },
              { id: "home" as const, label: "Melhores Descontos" },
              { id: "home" as const, label: "Baixe o APP" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setScreen(item.id)}
                className="text-white/80 hover:text-white hover:bg-white/10 transition px-4 h-full font-medium whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
