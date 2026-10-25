import { NextResponse } from "next/server";

// Comprehensive Indian Food Database based on ICMR-NIN IFCT 2024
export const FOODS_DB = [
  {
    id: 1,
    name: "Whole Wheat Chapati / Phulka (No Ghee)",
    alternate_names: "roti, chapati, phulka, tawa roti",
    regional_names: "Hindi: Roti, Tamil: Chappathi, Bengali: Ruti",
    category: "Cereals & Millets",
    state: "cooked",
    default_serving_name: "1 roti (35g)",
    default_serving_grams: 35.0,
    calories_per_100g: 300.0,
    protein_per_100g: 8.9,
    carbs_per_100g: 60.0,
    fat_per_100g: 2.0,
    fiber_per_100g: 9.5,
    sodium_mg_per_100g: 180.0,
    potassium_mg_per_100g: 280.0,
    calcium_mg_per_100g: 35.0,
    iron_mg_per_100g: 3.2,
    allergens: "gluten",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    glycemic_index_level: "medium",
    data_source: "ICMR-NIN IFCT 2024",
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    name: "Steamed White Rice (Cooked)",
    alternate_names: "chawal, sadham, bhaat, plain rice",
    regional_names: "Hindi: Chawal, Tamil: Sadham, Telugu: Annam",
    category: "Cereals & Millets",
    state: "cooked",
    default_serving_name: "1 medium bowl (150g)",
    default_serving_grams: 150.0,
    calories_per_100g: 130.0,
    protein_per_100g: 2.7,
    carbs_per_100g: 28.2,
    fat_per_100g: 0.3,
    fiber_per_100g: 0.4,
    sodium_mg_per_100g: 1.0,
    potassium_mg_per_100g: 35.0,
    calcium_mg_per_100g: 10.0,
    iron_mg_per_100g: 0.5,
    allergens: "",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    glycemic_index_level: "high",
    data_source: "ICMR-NIN IFCT 2024",
    image_url: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    name: "Moong Dal Tadka (Cooked)",
    alternate_names: "yellow dal, yellow lentil curry, peeli dal",
    regional_names: "Hindi: Moong Dal, Tamil: Paasi Paruppu",
    category: "Pulses & Legumes",
    state: "cooked",
    default_serving_name: "1 katori (150g)",
    default_serving_grams: 150.0,
    calories_per_100g: 110.0,
    protein_per_100g: 6.3,
    carbs_per_100g: 15.0,
    fat_per_100g: 3.0,
    fiber_per_100g: 3.8,
    sodium_mg_per_100g: 220.0,
    potassium_mg_per_100g: 210.0,
    calcium_mg_per_100g: 24.0,
    iron_mg_per_100g: 2.0,
    allergens: "",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    glycemic_index_level: "low",
    data_source: "ICMR-NIN IFCT 2024",
    image_url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    name: "Steamed Idli",
    alternate_names: "idly, steamed rice lentil cake",
    regional_names: "Tamil: Idli, Kannada: Idli, Telugu: Idli",
    category: "Cereals & Millets",
    state: "cooked",
    default_serving_name: "2 pieces (80g)",
    default_serving_grams: 80.0,
    calories_per_100g: 145.0,
    protein_per_100g: 4.0,
    carbs_per_100g: 30.0,
    fat_per_100g: 0.5,
    fiber_per_100g: 1.6,
    sodium_mg_per_100g: 120.0,
    potassium_mg_per_100g: 110.0,
    calcium_mg_per_100g: 22.0,
    iron_mg_per_100g: 1.1,
    allergens: "",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    glycemic_index_level: "medium",
    data_source: "ICMR-NIN IFCT 2024",
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    name: "Vegetable Poha",
    alternate_names: "flattened rice, pohay, aval upma",
    regional_names: "Marathi: Kanda Poha, Hindi: Poha, Tamil: Aval",
    category: "Cereals & Millets",
    state: "cooked",
    default_serving_name: "1 plate (150g)",
    default_serving_grams: 150.0,
    calories_per_100g: 160.0,
    protein_per_100g: 3.2,
    carbs_per_100g: 27.5,
    fat_per_100g: 4.2,
    fiber_per_100g: 2.1,
    sodium_mg_per_100g: 190.0,
    potassium_mg_per_100g: 85.0,
    calcium_mg_per_100g: 24.0,
    iron_mg_per_100g: 2.5,
    allergens: "peanuts,mustard",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    glycemic_index_level: "medium",
    data_source: "ICMR-NIN IFCT 2024",
    image_url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    name: "Palak Paneer (Spinach Cottage Cheese)",
    alternate_names: "spinach paneer, saag paneer",
    regional_names: "Hindi: Palak Paneer, Punjabi: Palak Paneer",
    category: "Vegetables",
    state: "cooked",
    default_serving_name: "1 bowl (180g)",
    default_serving_grams: 180.0,
    calories_per_100g: 138.0,
    protein_per_100g: 8.1,
    carbs_per_100g: 4.5,
    fat_per_100g: 10.0,
    fiber_per_100g: 2.6,
    sodium_mg_per_100g: 250.0,
    potassium_mg_per_100g: 280.0,
    calcium_mg_per_100g: 210.0,
    iron_mg_per_100g: 3.4,
    allergens: "dairy",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    glycemic_index_level: "low",
    data_source: "ICMR-NIN IFCT 2024",
    image_url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    name: "Indian Egg Bhurji (Scrambled with Onions & Spices)",
    alternate_names: "scrambled eggs, anda bhurji",
    regional_names: "Hindi: Anda Bhurji, Tamil: Muttai Podimas",
    category: "Flesh Foods & Eggs",
    state: "cooked",
    default_serving_name: "2 eggs portion (120g)",
    default_serving_grams: 120.0,
    calories_per_100g: 170.0,
    protein_per_100g: 12.2,
    carbs_per_100g: 3.8,
    fat_per_100g: 11.8,
    fiber_per_100g: 0.8,
    sodium_mg_per_100g: 240.0,
    potassium_mg_per_100g: 160.0,
    calcium_mg_per_100g: 55.0,
    iron_mg_per_100g: 2.1,
    allergens: "eggs",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: true,
    glycemic_index_level: "low",
    data_source: "ICMR-NIN IFCT 2024",
    image_url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    name: "Plain Curd / Dahi (Cow Milk, Whole)",
    alternate_names: "dahi, yogurt, thayir, mosaru",
    regional_names: "Hindi: Dahi, Tamil: Thayir, Telugu: Perugu",
    category: "Dairy & Milk",
    state: "cooked",
    default_serving_name: "1 katori (150g)",
    default_serving_grams: 150.0,
    calories_per_100g: 62.0,
    protein_per_100g: 3.4,
    carbs_per_100g: 4.7,
    fat_per_100g: 3.3,
    fiber_per_100g: 0.0,
    sodium_mg_per_100g: 46.0,
    potassium_mg_per_100g: 140.0,
    calcium_mg_per_100g: 150.0,
    iron_mg_per_100g: 0.1,
    allergens: "dairy",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    glycemic_index_level: "low",
    data_source: "ICMR-NIN IFCT 2024",
    image_url: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 9,
    name: "Fresh Kachumber Salad (Cucumber, Tomato, Onion)",
    alternate_names: "cucumber tomato salad, indian salad",
    regional_names: "Hindi: Kachumber, Tamil: Salad",
    category: "Vegetables",
    state: "raw",
    default_serving_name: "1 small bowl (100g)",
    default_serving_grams: 100.0,
    calories_per_100g: 25.0,
    protein_per_100g: 1.1,
    carbs_per_100g: 4.8,
    fat_per_100g: 0.2,
    fiber_per_100g: 1.8,
    sodium_mg_per_100g: 8.0,
    potassium_mg_per_100g: 180.0,
    calcium_mg_per_100g: 18.0,
    iron_mg_per_100g: 0.5,
    allergens: "",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    glycemic_index_level: "low",
    data_source: "ICMR-NIN IFCT 2024",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80"
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase().trim();
  const category = searchParams.get("category")?.toLowerCase().trim();
  const preference = searchParams.get("preference")?.toLowerCase().trim();

  let filtered = [...FOODS_DB];

  if (q) {
    filtered = filtered.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.alternate_names.toLowerCase().includes(q) ||
        f.regional_names.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
    );
  }

  if (category) {
    filtered = filtered.filter((f) => f.category.toLowerCase().includes(category));
  }

  if (preference) {
    if (preference === "vegetarian") filtered = filtered.filter((f) => f.is_vegetarian);
    if (preference === "vegan") filtered = filtered.filter((f) => f.is_vegan);
    if (preference === "eggetarian") filtered = filtered.filter((f) => f.is_eggetarian);
  }

  return NextResponse.json(filtered);
}
