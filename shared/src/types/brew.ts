export const BREW_METHODS = [
  "Aeropress",
  "V60",
  "Drip coffee",
  "French press",
  "Espresso",
  "Moka pot",
  "Cold brew",
  "Chemex",
] as const;

export type Brew = {
  id: string;
  beans: string;
  method: string;
  coffee_grams: number;
  water_grams: number;
  rating: number;
  tasting_notes: string;
  created_at: string;
  updated_at: string;
};

export type BrewInput = Omit<Brew, "id" | "created_at" | "updated_at">;
