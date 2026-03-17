import { ChevronRight } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_ICONS, type ProductCategory } from "../data/products";
import { useApp } from "../context/AppContext";
import SJHeader from "./SJHeader";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ProductCategory[];

export default function CategoriesScreen() {
  const { setSelectedCategory, setScreen } = useApp();

  function handleSelect(cat: ProductCategory) {
    setSelectedCategory(cat);
    setScreen("home");
  }

  return (
    <div className="flex flex-col bg-white pb-4">
      <SJHeader />
      <div className="px-4 pt-3 pb-2 border-b border-sj-gray-200">
        <h1 className="text-lg font-bold text-sj-navy">Departamentos</h1>
      </div>

      <div className="flex flex-col">
        {CATEGORIES.map((cat, idx) => (
          <button
            key={cat}
            onClick={() => handleSelect(cat)}
            className={`flex items-center gap-4 px-4 py-4 hover:bg-sj-gray-50 transition ${
              idx < CATEGORIES.length - 1 ? "border-b border-sj-gray-100" : ""
            }`}
          >
            <div className="h-12 w-12 rounded-full bg-sj-gray-50 flex items-center justify-center text-2xl">
              {CATEGORY_ICONS[cat]}
            </div>
            <span className="flex-1 text-left text-sm font-medium text-sj-navy">
              {CATEGORY_LABELS[cat]}
            </span>
            <ChevronRight className="h-4 w-4 text-sj-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
}
