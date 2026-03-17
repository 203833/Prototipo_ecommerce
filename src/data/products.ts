export type ProductCategory =
  | "medicamentos"
  | "medicamentos_especiais"
  | "infantil"
  | "dermocosmeticos"
  | "higiene"
  | "vitaminas";

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  medicamentos: "Medicamentos",
  medicamentos_especiais: "Medicamentos Especiais",
  infantil: "Infantil",
  dermocosmeticos: "Dermocosméticos",
  higiene: "Higiene e Beleza",
  vitaminas: "Vitaminas",
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  medicamentos: "💊",
  medicamentos_especiais: "🏥",
  infantil: "👶",
  dermocosmeticos: "✨",
  higiene: "🧴",
  vitaminas: "🍊",
};

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice: number | null;
  description: string;
  requiresPrescription: boolean;
  imageEmoji: string;
};

function discount(orig: number, sale: number): { price: number; originalPrice: number } {
  return { price: sale, originalPrice: orig };
}

export const PRODUCTS: Product[] = [
  { id: "med-01", name: "Transamin Nikkho 250mg 12 Compr...", category: "medicamentos", ...discount(85.35, 73.89), description: "Ácido Tranexâmico 250mg", requiresPrescription: true, imageEmoji: "💊" },
  { id: "med-02", name: "Macrodantina 100mg 40 Cápsu...", category: "medicamentos", ...discount(24.26, 22.29), description: "Nitrofurantoína 100mg", requiresPrescription: true, imageEmoji: "💊" },
  { id: "med-03", name: "Dipirona Sódica 500mg 20 Comp.", category: "medicamentos", price: 8.90, originalPrice: null, description: "Analgésico e antitérmico genérico", requiresPrescription: false, imageEmoji: "💊" },
  { id: "med-04", name: "Ibuprofeno 400mg 20 Comp.", category: "medicamentos", ...discount(14.90, 12.50), description: "Anti-inflamatório genérico", requiresPrescription: false, imageEmoji: "💊" },
  { id: "med-05", name: "Paracetamol 750mg 20 Comp.", category: "medicamentos", price: 6.90, originalPrice: null, description: "Analgésico genérico", requiresPrescription: false, imageEmoji: "💊" },
  { id: "med-06", name: "Dorflex 36 Comprimidos", category: "medicamentos", ...discount(15.90, 11.90), description: "Analgésico e relaxante muscular", requiresPrescription: false, imageEmoji: "💪" },
  { id: "med-07", name: "Losartana 50mg 30 Comp.", category: "medicamentos", price: 15.90, originalPrice: null, description: "Anti-hipertensivo genérico", requiresPrescription: true, imageEmoji: "❤️" },
  { id: "med-08", name: "Omeprazol 20mg 28 Cáps.", category: "medicamentos", ...discount(22.50, 18.50), description: "Protetor gástrico genérico", requiresPrescription: false, imageEmoji: "💊" },

  { id: "me-01", name: "Mounjaro Tirzepatida 2,5mg", category: "medicamentos_especiais", ...discount(1689.90, 1449.90), description: "Caneta preenchida - uso SC", requiresPrescription: true, imageEmoji: "💉" },
  { id: "me-02", name: "Amoxicilina 500mg 21 Cáps.", category: "medicamentos_especiais", price: 28.90, originalPrice: null, description: "Antibiótico genérico", requiresPrescription: true, imageEmoji: "💉" },
  { id: "me-03", name: "Loratadina 10mg 12 Comp.", category: "medicamentos_especiais", ...discount(12.90, 9.90), description: "Antialérgico genérico", requiresPrescription: false, imageEmoji: "🤧" },

  { id: "inf-01", name: "Fralda Pampers Confort Sec M 66un", category: "infantil", ...discount(49.90, 40.90), description: "Leve 4 Pague 3", requiresPrescription: false, imageEmoji: "👶" },
  { id: "inf-02", name: "Fralda Huggies Máxima Proteção M 192un", category: "infantil", ...discount(139.90, 111.90), description: "Leve 4 Pague 3", requiresPrescription: false, imageEmoji: "👶" },
  { id: "inf-03", name: "Pomada Bepantol Baby 30g", category: "infantil", price: 29.90, originalPrice: null, description: "Prevenção de assaduras", requiresPrescription: false, imageEmoji: "🍑" },
  { id: "inf-04", name: "Sabonete Johnson's Baby 200ml", category: "infantil", ...discount(12.90, 9.90), description: "Sabonete líquido suave", requiresPrescription: false, imageEmoji: "🛁" },

  { id: "dc-01", name: "Sérum Vitamina C La Roche-Posay 30ml", category: "dermocosmeticos", ...discount(99.90, 89.90), description: "Antioxidante facial", requiresPrescription: false, imageEmoji: "✨" },
  { id: "dc-02", name: "Hidratante Cerave 200ml", category: "dermocosmeticos", ...discount(72.90, 62.90), description: "Loção hidratante corporal", requiresPrescription: false, imageEmoji: "💧" },
  { id: "dc-03", name: "Protetor Facial FPS 60 La Roche 40g", category: "dermocosmeticos", price: 55.90, originalPrice: null, description: "Anthelios protetor solar", requiresPrescription: false, imageEmoji: "🛡️" },

  { id: "hig-01", name: "Shampoo Anticaspa H&S 200ml", category: "higiene", ...discount(28.90, 24.90), description: "Head & Shoulders limpeza profunda", requiresPrescription: false, imageEmoji: "🧴" },
  { id: "hig-02", name: "Creme Dental Colgate Total 12 90g", category: "higiene", price: 8.50, originalPrice: null, description: "Proteção antibacteriana 12h", requiresPrescription: false, imageEmoji: "🦷" },
  { id: "hig-03", name: "Desodorante Rexona Aerosol 150ml", category: "higiene", ...discount(19.90, 16.90), description: "Proteção 48h", requiresPrescription: false, imageEmoji: "🧊" },
  { id: "hig-04", name: "Protetor Solar FPS 50 Sundown 200ml", category: "higiene", price: 45.90, originalPrice: null, description: "Proteção UVA/UVB", requiresPrescription: false, imageEmoji: "☀️" },

  { id: "vit-01", name: "Vitamina C 1000mg 30 Comp. Eferv.", category: "vitaminas", price: 22.90, originalPrice: null, description: "Comprimidos efervescentes", requiresPrescription: false, imageEmoji: "🍊" },
  { id: "vit-02", name: "Vitamina D3 2000UI 60 Cáps.", category: "vitaminas", ...discount(38.90, 32.90), description: "Suplemento de vitamina D", requiresPrescription: false, imageEmoji: "☀️" },
  { id: "vit-03", name: "Ômega 3 EPA/DHA 1000mg 60 Cáps.", category: "vitaminas", price: 48.90, originalPrice: null, description: "Óleo de peixe concentrado", requiresPrescription: false, imageEmoji: "🐟" },
  { id: "vit-04", name: "Centrum Multivitamínico 60 Comp.", category: "vitaminas", ...discount(69.90, 59.90), description: "Polivitamínico completo", requiresPrescription: false, imageEmoji: "💎" },
];

function seedRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function getStoreStock(storeCode: string, productId: string): number {
  const hash = Array.from(storeCode + productId).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = seedRandom(hash);

  if (rand < 0.08) return 0;
  if (rand < 0.25) return Math.floor(rand * 4) + 1;
  if (rand < 0.55) return Math.floor(rand * 10) + 3;
  return Math.floor(rand * 20) + 5;
}

export function hasStock(storeCode: string, productId: string): boolean {
  return getStoreStock(storeCode, productId) > 0;
}
