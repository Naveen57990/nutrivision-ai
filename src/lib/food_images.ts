export interface FoodPhotoMeta {
  id: string;
  name: string;
  category: string;
  url: string;
  altText: string;
  aspectRatio: string;
  credit: string;
}

export const FOOD_PHOTOS: Record<string, FoodPhotoMeta> = {
  thali_hero: {
    id: "thali_hero",
    name: "Complete Indian Thali",
    category: "Thali",
    url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80",
    altText: "Artistically arranged balanced Indian meal with whole grain roti, dal tadka, and seasonal vegetables",
    aspectRatio: "16:9",
    credit: "Unsplash"
  },
  rice_dal: {
    id: "rice_dal",
    name: "Dal Tadka with Steamed Rice",
    category: "Pulses & Legumes",
    url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    altText: "Golden tempered toor dal served alongside fragrant steamed rice",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  roti_sabzi: {
    id: "roti_sabzi",
    name: "Whole Wheat Roti & Sabzi",
    category: "Cereals & Millets",
    url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80",
    altText: "Freshly prepared whole wheat phulkas with spiced seasonal vegetable sabzi",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  idli_sambar: {
    id: "idli_sambar",
    name: "Steamed Idli with Sambar",
    category: "Cereals & Millets",
    url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    altText: "Pillowy soft fermented steamed idlis served with vegetable drumstick sambar",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  dosa_crispy: {
    id: "dosa_crispy",
    name: "Golden Masala Dosa",
    category: "Cereals & Millets",
    url: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
    altText: "Crispy fermented rice and lentil crepe rolled with aromatic potato masala",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  khichdi: {
    id: "khichdi",
    name: "Moong Dal Khichdi",
    category: "Cereals & Millets",
    url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
    altText: "Comforting yellow moong dal and rice porridge tempered with ghee and cumin",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  poha: {
    id: "poha",
    name: "Vegetable Kanda Poha",
    category: "Cereals & Millets",
    url: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80",
    altText: "Fluffy turmeric flattened rice with mustard seeds, curry leaves, and green peas",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  paneer_palak: {
    id: "paneer_palak",
    name: "Palak Paneer",
    category: "Dairy & Vegetables",
    url: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80",
    altText: "Fresh artisanal cottage cheese cubes in a vibrant pureed spinach gravy",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  egg_bhurji: {
    id: "egg_bhurji",
    name: "Indian Egg Bhurji",
    category: "Flesh Foods & Eggs",
    url: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
    altText: "Soft-scrambled farm fresh eggs sautéed with onions, green chilies, and coriander",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  curd_dahi: {
    id: "curd_dahi",
    name: "Fresh Curd / Dahi",
    category: "Dairy & Milk",
    url: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?auto=format&fit=crop&w=800&q=80",
    altText: "Thick probiotic-rich whole milk yogurt in a traditional ceramic serving bowl",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  kachumber_salad: {
    id: "kachumber_salad",
    name: "Fresh Kachumber Salad",
    category: "Vegetables",
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    altText: "Crisp diced cucumbers, garden tomatoes, and red onions with fresh lemon dressing",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  fruit_bowl: {
    id: "fruit_bowl",
    name: "Seasonal Fresh Fruit Bowl",
    category: "Fruits",
    url: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=800&q=80",
    altText: "Antioxidant-dense diced papaya, pomegranate arils, and seasonal citrus",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  chicken_curry: {
    id: "chicken_curry",
    name: "Tariwala Chicken Curry",
    category: "Flesh Foods & Eggs",
    url: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=800&q=80",
    altText: "Homestyle braised chicken in a lightly spiced onion-tomato gravy",
    aspectRatio: "4:3",
    credit: "Unsplash"
  },
  masala_chai: {
    id: "masala_chai",
    name: "Aromatic Masala Chai",
    category: "Beverages",
    url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
    altText: "Steaming spiced tea infused with cardamom, ginger, and fresh milk",
    aspectRatio: "4:3",
    credit: "Unsplash"
  }
};

export function getFoodImage(dishName: string, category?: string): string {
  const norm = dishName.toLowerCase();

  if (norm.includes("idli") || norm.includes("sambar")) return FOOD_PHOTOS.idli_sambar.url;
  if (norm.includes("dosa")) return FOOD_PHOTOS.dosa_crispy.url;
  if (norm.includes("poha")) return FOOD_PHOTOS.poha.url;
  if (norm.includes("khichdi") || norm.includes("khichuri")) return FOOD_PHOTOS.khichdi.url;
  if (norm.includes("roti") || norm.includes("chapati") || norm.includes("phulka") || norm.includes("sabzi")) return FOOD_PHOTOS.roti_sabzi.url;
  if (norm.includes("paneer")) return FOOD_PHOTOS.paneer_palak.url;
  if (norm.includes("egg") || norm.includes("anda") || norm.includes("bhurji")) return FOOD_PHOTOS.egg_bhurji.url;
  if (norm.includes("curd") || norm.includes("dahi") || norm.includes("yogurt") || norm.includes("thayir")) return FOOD_PHOTOS.curd_dahi.url;
  if (norm.includes("salad") || norm.includes("kachumber") || norm.includes("cucumber")) return FOOD_PHOTOS.kachumber_salad.url;
  if (norm.includes("fruit") || norm.includes("papaya") || norm.includes("banana")) return FOOD_PHOTOS.fruit_bowl.url;
  if (norm.includes("chicken") || norm.includes("murgh") || norm.includes("meat")) return FOOD_PHOTOS.chicken_curry.url;
  if (norm.includes("chai") || norm.includes("tea") || norm.includes("coffee")) return FOOD_PHOTOS.masala_chai.url;
  if (norm.includes("dal") || norm.includes("rice") || norm.includes("chawal")) return FOOD_PHOTOS.rice_dal.url;

  // Fallback by category
  if (category?.toLowerCase().includes("fruit")) return FOOD_PHOTOS.fruit_bowl.url;
  if (category?.toLowerCase().includes("vegetable")) return FOOD_PHOTOS.kachumber_salad.url;
  if (category?.toLowerCase().includes("dairy")) return FOOD_PHOTOS.curd_dahi.url;

  // Global default
  return FOOD_PHOTOS.thali_hero.url;
}
