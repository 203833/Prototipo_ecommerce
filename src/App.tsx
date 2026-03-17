import { AppProvider, useApp } from "./context/AppContext";
import HomeScreen from "./components/HomeScreen";
import CartScreen from "./components/CartScreen";
import OrderConfirmationScreen from "./components/OrderConfirmationScreen";
import CategoriesScreen from "./components/CategoriesScreen";
import PlaceholderScreen from "./components/PlaceholderScreen";
import CartDrawer from "./components/CartDrawer";

function AppContent() {
  const { screen } = useApp();

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <main className="flex-1">
        {screen === "home" && <HomeScreen />}
        {screen === "categories" && <CategoriesScreen />}
        {screen === "cart" && <CartScreen />}
        {screen === "checkout" && <CartScreen />}
        {screen === "confirmed" && <OrderConfirmationScreen />}
        {screen === "cupons" && <PlaceholderScreen title="Cupons" icon="🏷️" desc="Seus cupons de desconto aparecerão aqui" />}
        {screen === "conta" && <PlaceholderScreen title="Minha Conta" icon="👤" desc="Gerencie seu perfil e pedidos" />}
      </main>
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
