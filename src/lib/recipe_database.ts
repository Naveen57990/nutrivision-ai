export interface DishRecipe {
  id: string;
  name: string;
  regional_cuisine: string;
  meal_types: ("breakfast" | "lunch" | "dinner" | "snack")[];
  prep_time_minutes: number;
  difficulty: "Easy" | "Medium" | "Advanced";
  description: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_eggetarian: boolean;
  allergens: string[];
  essential_ingredients: string[];
  optional_ingredients: string[];
  default_serving_size: string;
  default_serving_grams: number;
  // Nutrients per serving
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sodium_mg: number;
  glycemic_index: "low" | "medium" | "high";
  instructions: string[];
  medical_tags: string[]; // e.g. ["diabetes_friendly", "bp_friendly", "high_protein", "fat_loss"]
  image_url?: string;
}

export const DISH_DATABASE: DishRecipe[] = [
  // =========================================================================
  // 1. OATS & FRUITS & BREAKFAST STAPLES
  // =========================================================================
  {
    id: "dish-banana-honey-oatmeal",
    name: "Warm Banana & Almond Oatmeal Porridge",
    regional_cuisine: "Global Health / Pan-Indian",
    meal_types: ["breakfast", "snack"],
    prep_time_minutes: 8,
    difficulty: "Easy",
    description: "Rolled oats gently simmered in warm milk, topped with freshly sliced ripe banana, crushed almonds, and a touch of honey.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy", "nuts"],
    essential_ingredients: ["oats", "milk", "banana"],
    optional_ingredients: ["honey", "almond", "cinnamon", "chia seeds", "walnuts"],
    default_serving_size: "1 large bowl (280g)",
    default_serving_grams: 280,
    calories: 320,
    protein_g: 13.5,
    carbs_g: 54.0,
    fat_g: 6.5,
    fiber_g: 7.2,
    sodium_mg: 110,
    glycemic_index: "low",
    medical_tags: ["heart_health", "bp_friendly", "fat_loss", "diabetes_friendly"],
    instructions: [
      "Bring 1 cup of low-fat milk (or plant milk) to a gentle simmer in a saucepan.",
      "Add 1/2 cup rolled oats and a pinch of cinnamon; cook on low heat for 4-5 minutes until thick and creamy.",
      "Pour into a bowl, top with sliced fresh banana, 4-5 crushed almonds, and half a teaspoon of honey or chia seeds."
    ]
  },
  {
    id: "dish-peanut-butter-oats",
    name: "High-Protein Peanut Butter & Banana Oatmeal",
    regional_cuisine: "Global Fitness",
    meal_types: ["breakfast", "snack"],
    prep_time_minutes: 8,
    difficulty: "Easy",
    description: "Energy-dense oats cooked in milk with creamy peanut butter and sweet sliced banana for sustained pre-workout or breakfast power.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy", "peanuts"],
    essential_ingredients: ["oats", "milk", "banana", "peanut butter", "peanuts"],
    optional_ingredients: ["honey", "cinnamon", "chia seeds"],
    default_serving_size: "1 hearty bowl (300g)",
    default_serving_grams: 300,
    calories: 410,
    protein_g: 19.0,
    carbs_g: 52.0,
    fat_g: 14.5,
    fiber_g: 8.0,
    sodium_mg: 160,
    glycemic_index: "low",
    medical_tags: ["high_protein", "muscle_gain", "sustained_energy"],
    instructions: [
      "Simmer oats in milk for 4 minutes until thick.",
      "Stir in 1 tablespoon of unsweetened peanut butter until completely dissolved and creamy.",
      "Top with sliced banana and enjoy warm."
    ]
  },
  {
    id: "dish-savory-vegetable-oats",
    name: "Savory Vegetable Masala Oats (Upma Style)",
    regional_cuisine: "South Indian / Pan-Indian",
    meal_types: ["breakfast", "snack", "dinner"],
    prep_time_minutes: 12,
    difficulty: "Easy",
    description: "Rolled oats sautéed with onions, green chilies, carrots, green peas, and fragrant mustard tadka.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["oats", "onion", "tomato"],
    optional_ingredients: ["carrot", "green peas", "green chili", "mustard seeds", "curry leaves", "coriander"],
    default_serving_size: "1 medium bowl (250g)",
    default_serving_grams: 250,
    calories: 260,
    protein_g: 9.5,
    carbs_g: 44.0,
    fat_g: 5.0,
    fiber_g: 7.5,
    sodium_mg: 290,
    glycemic_index: "low",
    medical_tags: ["diabetes_friendly", "bp_friendly", "fat_loss"],
    instructions: [
      "Heat 1 tsp oil, splutter mustard seeds and curry leaves. Sauté finely chopped onion and green chilies.",
      "Add diced tomatoes, carrots, turmeric, and salt. Cook for 2 minutes until vegetables soften.",
      "Add 1/2 cup rolled oats and 1 cup water. Simmer for 3 minutes until thick and savory. Garnish with lemon juice and coriander."
    ]
  },
  {
    id: "dish-kanda-batata-poha",
    name: "Classic Kanda Batata Poha with Roasted Peanuts",
    regional_cuisine: "Maharashtrian / West Indian",
    meal_types: ["breakfast", "snack"],
    prep_time_minutes: 12,
    difficulty: "Easy",
    description: "Fluffy flattened rice tossed with golden sautéed onions, tender diced potatoes, crunchy peanuts, turmeric, and fresh cilantro.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: ["peanuts"],
    essential_ingredients: ["poha", "flattened rice", "onion", "potato", "peanuts"],
    optional_ingredients: ["mustard seeds", "curry leaves", "green chili", "lemon", "coriander", "turmeric"],
    default_serving_size: "1 plate (200g)",
    default_serving_grams: 200,
    calories: 290,
    protein_g: 7.8,
    carbs_g: 48.0,
    fat_g: 8.0,
    fiber_g: 4.8,
    sodium_mg: 240,
    glycemic_index: "medium",
    medical_tags: ["bp_friendly", "easy_digestion"],
    instructions: [
      "Rinse thick poha in a colander under running water for 30 seconds; drain and rest for 5 minutes.",
      "Heat 1 tsp oil, roast peanuts until golden, and set aside. In the same pan, splutter mustard seeds and curry leaves.",
      "Add finely diced potatoes and onions; sauté covered until potatoes are tender and golden.",
      "Add turmeric, green chilies, salt, rinsed poha, and roasted peanuts. Toss gently on low flame for 2 mins. Finish with fresh lemon juice."
    ]
  },
  {
    id: "dish-rava-upma",
    name: "Vegetable Sooji Rava Upma with Cashews",
    regional_cuisine: "South Indian",
    meal_types: ["breakfast", "snack"],
    prep_time_minutes: 15,
    difficulty: "Easy",
    description: "Light roasted semolina tempered with mustard seeds, ginger, curry leaves, and colorful vegetables.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: ["gluten", "nuts"],
    essential_ingredients: ["sooji", "rava", "semolina", "onion"],
    optional_ingredients: ["carrot", "green peas", "ginger", "mustard seeds", "curry leaves", "cashews"],
    default_serving_size: "1 bowl (200g)",
    default_serving_grams: 200,
    calories: 275,
    protein_g: 7.2,
    carbs_g: 46.0,
    fat_g: 6.5,
    fiber_g: 4.0,
    sodium_mg: 280,
    glycemic_index: "medium",
    medical_tags: ["bp_friendly"],
    instructions: [
      "Dry roast 1/2 cup rava/sooji on low flame for 3 minutes until aromatic; set aside.",
      "Heat 1 tsp oil, add mustard seeds, ginger, curry leaves, onions, and carrots. Cook for 2 minutes.",
      "Pour in 1.25 cups water with pinch of salt; bring to a rapid boil.",
      "Slowly stream in roasted rava while whisking continuously to avoid lumps. Cover and steam on low for 2 mins."
    ]
  },
  {
    id: "dish-banana-peanut-smoothie",
    name: "High-Protein Banana Peanut Butter Smoothie",
    regional_cuisine: "Global Fitness",
    meal_types: ["breakfast", "snack"],
    prep_time_minutes: 5,
    difficulty: "Easy",
    description: "Creamy, naturally sweet protein shake made with chilled milk, ripe banana, peanut butter, and a hint of cinnamon.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy", "peanuts"],
    essential_ingredients: ["banana", "milk", "peanut butter", "peanuts"],
    optional_ingredients: ["oats", "honey", "chia seeds", "cinnamon"],
    default_serving_size: "1 tall glass (350ml)",
    default_serving_grams: 350,
    calories: 340,
    protein_g: 18.0,
    carbs_g: 45.0,
    fat_g: 11.0,
    fiber_g: 5.5,
    sodium_mg: 140,
    glycemic_index: "low",
    medical_tags: ["muscle_gain", "high_protein", "post_workout"],
    instructions: [
      "Add 1 ripe banana, 1 cup cold milk, 1.5 tbsp peanut butter, and 1 tbsp rolled oats into a blender jar.",
      "Blend on high for 45 seconds until velvety smooth and frothy.",
      "Pour into a tall glass and sprinkle with cinnamon."
    ]
  },

  // =========================================================================
  // 2. HIGH-PROTEIN VEGETARIAN: PANEER, SOYA, BESAN & SPROUTS
  // =========================================================================
  {
    id: "dish-palak-paneer",
    name: "High-Protein Palak Paneer with Phulkas",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Creamy pureed spinach stew simmered with tender fresh cottage cheese cubes and fragrant garlic tadka.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy", "gluten"],
    essential_ingredients: ["paneer", "spinach", "palak", "tomato", "wheat flour", "atta", "roti"],
    optional_ingredients: ["garlic", "green chili", "cumin", "onion", "ginger"],
    default_serving_size: "1.5 katori (200g) sabzi + 2 phulkas (60g)",
    default_serving_grams: 260,
    calories: 420,
    protein_g: 24.5,
    carbs_g: 38.0,
    fat_g: 18.0,
    fiber_g: 8.2,
    sodium_mg: 360,
    glycemic_index: "low",
    medical_tags: ["high_protein", "diabetes_friendly", "bp_friendly", "muscle_gain"],
    instructions: [
      "Blanch 2 cups spinach in boiling water for 2 mins, chill in ice water, and puree with 1 green chili.",
      "Sauté minced garlic, cumin seeds, and finely chopped onion in 1 tsp oil until fragrant.",
      "Stir in pureed spinach, fresh paneer cubes, and season with mild salt. Simmer gently for 4 mins.",
      "Serve warm with whole wheat phulkas."
    ]
  },
  {
    id: "dish-paneer-bhurji",
    name: "Masala Paneer Bhurji with Whole Wheat Toast",
    regional_cuisine: "North Indian",
    meal_types: ["breakfast", "lunch", "dinner"],
    prep_time_minutes: 12,
    difficulty: "Easy",
    description: "Crumbled cottage cheese sautéed with finely chopped onions, tomatoes, ginger, and turmeric.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy", "gluten"],
    essential_ingredients: ["paneer", "onion", "tomato"],
    optional_ingredients: ["green chili", "coriander", "black pepper", "bread", "roti", "toast"],
    default_serving_size: "1 medium bowl (150g) bhurji + 2 rotis or toasts",
    default_serving_grams: 210,
    calories: 395,
    protein_g: 22.0,
    carbs_g: 32.0,
    fat_g: 19.0,
    fiber_g: 6.0,
    sodium_mg: 320,
    glycemic_index: "low",
    medical_tags: ["high_protein", "diabetes_friendly", "muscle_gain"],
    instructions: [
      "Heat 1 tsp oil in a pan, add cumin, chopped onions, and sauté until light golden.",
      "Add diced tomatoes, turmeric, and pinch of black pepper; cook until soft.",
      "Crumble fresh paneer into the pan and toss gently for 2-3 minutes. Garnish with chopped coriander."
    ]
  },
  {
    id: "dish-tawa-paneer-tikka",
    name: "Tawa Paneer Tikka with Grilled Bell Peppers",
    regional_cuisine: "North Indian / Tandoori",
    meal_types: ["snack", "dinner"],
    prep_time_minutes: 18,
    difficulty: "Easy",
    description: "Cubes of paneer and crunchy capsicum marinated in spiced curd and pan-seared to a charred, smokey finish.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy"],
    essential_ingredients: ["paneer", "curd", "capsicum", "bell pepper", "onion"],
    optional_ingredients: ["chaat masala", "lemon", "ginger-garlic", "kasuri methi"],
    default_serving_size: "1 plate (220g) tikka + mint chutney",
    default_serving_grams: 220,
    calories: 360,
    protein_g: 23.0,
    carbs_g: 16.0,
    fat_g: 22.0,
    fiber_g: 4.8,
    sodium_mg: 340,
    glycemic_index: "low",
    medical_tags: ["high_protein", "diabetes_friendly", "muscle_gain"],
    instructions: [
      "In a bowl, mix 3 tbsp thick curd, turmeric, cumin powder, garam masala, salt, and 1 tsp lemon juice.",
      "Coat paneer cubes, sliced onions, and bell peppers in the marinade; rest 10 mins.",
      "Sear on a hot non-stick tawa with 1 tsp oil for 3-4 minutes per side until charred and golden."
    ]
  },
  {
    id: "dish-besan-chilla",
    name: "Crispy Vegetable Besan Chilla (Cheela)",
    regional_cuisine: "North Indian",
    meal_types: ["breakfast", "snack", "dinner"],
    prep_time_minutes: 15,
    difficulty: "Easy",
    description: "Nutritious savory chickpea flour pancakes studded with crunchy onions, tomatoes, and fresh coriander.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["besan", "gram flour", "onion", "tomato"],
    optional_ingredients: ["paneer", "green chili", "ajwain", "coriander", "turmeric"],
    default_serving_size: "2 large chillas (180g) + mint chutney",
    default_serving_grams: 180,
    calories: 310,
    protein_g: 16.5,
    carbs_g: 42.0,
    fat_g: 7.5,
    fiber_g: 8.5,
    sodium_mg: 280,
    glycemic_index: "low",
    medical_tags: ["diabetes_friendly", "high_fiber", "bp_friendly", "fat_loss"],
    instructions: [
      "Whisk 1 cup besan with water, carom seeds (ajwain), turmeric, and salt to make a smooth pouring batter.",
      "Fold in finely chopped onions, tomatoes, green chilies, and coriander.",
      "Pour a ladle of batter onto a hot non-stick pan, drizzle 1/2 tsp oil, and cook until golden brown on both sides."
    ]
  },
  {
    id: "dish-soya-chunks-curry",
    name: "High-Protein Soya Chunks Masala Curry",
    regional_cuisine: "Pan-Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Tender, juicy soya chunks cooked in a deeply spiced onion-tomato homestyle gravy.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: ["soy"],
    essential_ingredients: ["soya chunks", "soya", "onion", "tomato"],
    optional_ingredients: ["ginger-garlic", "green chili", "coriander", "garam masala", "rice", "roti"],
    default_serving_size: "1.5 katori (220g) curry + 2 phulkas or 1 cup rice",
    default_serving_grams: 280,
    calories: 390,
    protein_g: 32.0,
    carbs_g: 42.0,
    fat_g: 7.0,
    fiber_g: 11.5,
    sodium_mg: 340,
    glycemic_index: "low",
    medical_tags: ["high_protein", "muscle_gain", "fat_loss", "diabetes_friendly"],
    instructions: [
      "Boil 1 cup soya chunks in salted water for 5 minutes; drain and squeeze out all excess water thoroughly.",
      "Sauté chopped onions, ginger, and garlic in 1 tsp oil until golden; add pureed tomatoes and spices.",
      "Add soya chunks and 1 cup water; simmer covered for 8-10 minutes until flavors absorb deeply."
    ]
  },
  {
    id: "dish-sprout-chaat",
    name: "Sprouted Moong & Cucumber Protein Chaat",
    regional_cuisine: "Pan-Indian Salad",
    meal_types: ["breakfast", "snack"],
    prep_time_minutes: 8,
    difficulty: "Easy",
    description: "Steamed sprouted green moong beans tossed with crunchy cucumbers, tomatoes, chaat masala, and fresh lemon juice.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["sprouts", "moong sprouts", "cucumber", "tomato", "onion"],
    optional_ingredients: ["lemon", "chaat masala", "pomegranate", "green chili", "coriander"],
    default_serving_size: "1 big bowl (220g)",
    default_serving_grams: 220,
    calories: 195,
    protein_g: 14.2,
    carbs_g: 31.0,
    fat_g: 1.5,
    fiber_g: 8.8,
    sodium_mg: 190,
    glycemic_index: "low",
    medical_tags: ["fat_loss", "diabetes_friendly", "bp_friendly", "high_fiber"],
    instructions: [
      "Steam 1.5 cups sprouted moong for 3 minutes (or use raw sprouted beans).",
      "Combine with diced cucumber, onion, tomato, and chopped coriander in a bowl.",
      "Toss with fresh lemon juice, roasted cumin powder, and black salt."
    ]
  },

  // =========================================================================
  // 3. WHOLESOME DALS & BEANS (KHICHDI, DAL TADKA, RAJMA, CHOLE)
  // =========================================================================
  {
    id: "dish-moong-khichdi",
    name: "Comforting Moong Dal Khichdi with Dahi",
    regional_cuisine: "Pan-Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Gentle one-pot porridge of yellow moong lentils and rice tempered with cumin, turmeric, and a touch of ghee, paired with probiotic curd.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy"],
    essential_ingredients: ["rice", "moong dal", "dal", "curd", "dahi"],
    optional_ingredients: ["cumin", "ghee", "turmeric", "ginger", "black pepper"],
    default_serving_size: "1 generous bowl (250g) + 1 small katori (100g) curd",
    default_serving_grams: 350,
    calories: 380,
    protein_g: 18.0,
    carbs_g: 62.0,
    fat_g: 6.0,
    fiber_g: 7.0,
    sodium_mg: 280,
    glycemic_index: "low",
    medical_tags: ["easy_digestion", "diabetes_friendly", "bp_friendly"],
    instructions: [
      "Wash 1/2 cup yellow moong dal and 1/2 cup rice together.",
      "Pressure cook with 3.5 cups water, turmeric, ginger, and salt for 3-4 whistles until soft and porridge-like.",
      "Temper with 1 tsp ghee and cumin seeds. Serve with fresh homemade curd."
    ]
  },
  {
    id: "dish-dal-tadka-rice",
    name: "Homestyle Dal Tadka with Steamed Jeera Rice",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 22,
    difficulty: "Easy",
    description: "Creamy cooked yellow toor dal tempered with sizzling garlic, cumin, tomatoes, and red chilies over fragrant jeera rice.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["toor dal", "dal", "rice", "tomato", "garlic"],
    optional_ingredients: ["onion", "cumin", "ghee", "coriander", "green chili"],
    default_serving_size: "1.5 katori (200g) dal + 1 cup (150g) jeera rice",
    default_serving_grams: 350,
    calories: 430,
    protein_g: 16.5,
    carbs_g: 74.0,
    fat_g: 7.0,
    fiber_g: 9.0,
    sodium_mg: 310,
    glycemic_index: "medium",
    medical_tags: ["bp_friendly", "comfort_food"],
    instructions: [
      "Pressure cook toor dal with turmeric and water until tender and creamy.",
      "Heat 1 tsp oil, add cumin seeds, minced garlic, and chopped onions until fragrant.",
      "Add diced tomatoes, cook until mushy, then pour in the cooked dal and simmer for 5 minutes. Serve with rice."
    ]
  },
  {
    id: "dish-curd-rice",
    name: "Soothing South Indian Curd Rice (Thayir Sadam)",
    regional_cuisine: "South Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 10,
    difficulty: "Easy",
    description: "Soft mashed rice blended with creamy chilled curd, tempered with mustard seeds, curry leaves, and grated ginger.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy"],
    essential_ingredients: ["rice", "curd", "dahi", "yogurt"],
    optional_ingredients: ["mustard seeds", "curry leaves", "ginger", "green chili", "pomegranate"],
    default_serving_size: "1 big bowl (280g)",
    default_serving_grams: 280,
    calories: 320,
    protein_g: 11.5,
    carbs_g: 52.0,
    fat_g: 6.8,
    fiber_g: 3.2,
    sodium_mg: 220,
    glycemic_index: "low",
    medical_tags: ["gut_health", "bp_friendly", "easy_digestion"],
    instructions: [
      "Mash 1 cup warm cooked rice lightly with a fork until soft.",
      "Mix in 1 cup fresh thick curd and 2 tablespoons milk with a pinch of salt.",
      "In a small ladle, heat 1 tsp oil, splutter mustard seeds, curry leaves, and minced ginger. Pour tadka over the curd rice."
    ]
  },
  {
    id: "dish-rajma-masala",
    name: "Punjabi Rajma Masala (Red Kidney Bean Curry)",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 25,
    difficulty: "Easy",
    description: "Plump red kidney beans simmered in a rich, slow-simmered onion-tomato gravy infused with ginger and whole spices.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["rajma", "kidney beans", "onion", "tomato"],
    optional_ingredients: ["ginger-garlic", "rice", "roti", "coriander", "cumin"],
    default_serving_size: "1.5 katori (220g) rajma + 1 cup rice or 2 rotis",
    default_serving_grams: 340,
    calories: 420,
    protein_g: 19.5,
    carbs_g: 68.0,
    fat_g: 7.5,
    fiber_g: 13.5,
    sodium_mg: 340,
    glycemic_index: "low",
    medical_tags: ["high_fiber", "diabetes_friendly", "muscle_gain"],
    instructions: [
      "Pressure cook soaked rajma until melt-in-mouth tender.",
      "Sauté onions and ginger-garlic in 1 tsp oil; add pureed tomatoes and spices; cook until oil separates.",
      "Add cooked rajma with its broth, mash a few beans to thicken gravy, and simmer for 10 mins."
    ]
  },
  {
    id: "dish-amritsari-chole",
    name: "Amritsari Chole (Spiced Chickpea Masala)",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 25,
    difficulty: "Easy",
    description: "Aromatic kabuli chana simmered in a dark, tangy tea-infused gravy spiced with dry mango and roasted cumin.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["chole", "chickpeas", "chana", "onion", "tomato"],
    optional_ingredients: ["ginger-garlic", "amchur", "bhature", "roti", "coriander"],
    default_serving_size: "1.5 katori (220g) chole + 2 phulkas or rice",
    default_serving_grams: 320,
    calories: 410,
    protein_g: 18.0,
    carbs_g: 65.0,
    fat_g: 8.0,
    fiber_g: 12.0,
    sodium_mg: 350,
    glycemic_index: "low",
    medical_tags: ["high_fiber", "diabetes_friendly"],
    instructions: [
      "Boil soaked chickpeas with a black tea pouch and whole spices until tender.",
      "Prepare a masala with onions, tomatoes, coriander powder, and amchur.",
      "Add boiled chickpeas, simmer on low heat for 12 minutes until gravy thickens."
    ]
  },

  // =========================================================================
  // 4. VEGETABLES, PARATHAS & HOMESTYLE SABZIS
  // =========================================================================
  {
    id: "dish-aloo-paratha",
    name: "Whole Wheat Stuffed Aloo Paratha with Curd",
    regional_cuisine: "North Indian",
    meal_types: ["breakfast", "lunch"],
    prep_time_minutes: 20,
    difficulty: "Medium",
    description: "Whole wheat flatbread stuffed with spiced mashed potatoes, roasted cumin, and green chilies, served with fresh curd.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["gluten", "dairy"],
    essential_ingredients: ["potato", "aloo", "wheat flour", "atta", "curd", "dahi"],
    optional_ingredients: ["onion", "cumin", "green chili", "coriander", "butter"],
    default_serving_size: "2 medium parathas + 1 cup curd",
    default_serving_grams: 260,
    calories: 390,
    protein_g: 12.0,
    carbs_g: 64.0,
    fat_g: 9.5,
    fiber_g: 6.5,
    sodium_mg: 280,
    glycemic_index: "medium",
    medical_tags: ["bp_friendly", "comfort_food"],
    instructions: [
      "Boil, peel, and mash potatoes with roasted cumin, finely chopped onion, green chili, and salt.",
      "Roll out whole wheat dough, place potato filling in center, seal, and gently roll out.",
      "Roast on a hot tawa with minimal oil or ghee until golden brown spots appear on both sides. Serve with curd."
    ]
  },
  {
    id: "dish-paneer-paratha",
    name: "High-Protein Paneer Paratha with Mint Raita",
    regional_cuisine: "North Indian",
    meal_types: ["breakfast", "lunch", "dinner"],
    prep_time_minutes: 18,
    difficulty: "Medium",
    description: "Crispy whole wheat paratha packed with spiced grated paneer, fresh coriander, and carom seeds.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy", "gluten"],
    essential_ingredients: ["paneer", "wheat flour", "atta", "roti"],
    optional_ingredients: ["coriander", "green chili", "ajwain", "curd", "onion"],
    default_serving_size: "2 parathas + 1 katori raita",
    default_serving_grams: 280,
    calories: 440,
    protein_g: 22.5,
    carbs_g: 48.0,
    fat_g: 18.0,
    fiber_g: 7.0,
    sodium_mg: 320,
    glycemic_index: "low",
    medical_tags: ["high_protein", "muscle_gain", "diabetes_friendly"],
    instructions: [
      "Grate fresh paneer; toss with chopped coriander, green chili, ajwain, and salt.",
      "Stuff inside whole wheat dough circles and roll out evenly.",
      "Cook on a medium-hot tawa with 1 tsp oil/ghee until crisp and golden."
    ]
  },
  {
    id: "dish-aloo-gobi",
    name: "Homestyle Aloo Gobi Matar with Whole Wheat Roti",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Tender florets of cauliflower, diced potatoes, and sweet green peas braised with cumin, ginger, and turmeric.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: ["gluten"],
    essential_ingredients: ["potato", "gobi", "cauliflower", "peas", "onion", "tomato"],
    optional_ingredients: ["wheat flour", "atta", "ginger", "coriander", "turmeric"],
    default_serving_size: "1.5 katori (200g) sabzi + 2 phulkas (60g)",
    default_serving_grams: 260,
    calories: 330,
    protein_g: 9.5,
    carbs_g: 58.0,
    fat_g: 6.5,
    fiber_g: 8.5,
    sodium_mg: 280,
    glycemic_index: "medium",
    medical_tags: ["bp_friendly", "high_fiber"],
    instructions: [
      "Heat 1 tsp oil in a kadai, splutter cumin seeds, and sauté minced ginger and onions.",
      "Add cauliflower florets, diced potatoes, green peas, turmeric, and coriander powder.",
      "Cover and cook on low heat with 3 tbsp water until vegetables are tender. Garnish with cilantro."
    ]
  },
  {
    id: "dish-bhindi-masala",
    name: "Crispy Garlic Bhindi Masala (Okra Sabzi)",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 18,
    difficulty: "Easy",
    description: "Slit fresh okra stir-fried with sliced onions, roasted garlic, amchur (dry mango powder), and coriander.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["bhindi", "okra", "onion"],
    optional_ingredients: ["garlic", "amchur", "turmeric", "roti", "wheat flour"],
    default_serving_size: "1.5 katori (180g) sabzi + 2 phulkas",
    default_serving_grams: 240,
    calories: 270,
    protein_g: 7.2,
    carbs_g: 44.0,
    fat_g: 7.0,
    fiber_g: 9.5,
    sodium_mg: 210,
    glycemic_index: "low",
    medical_tags: ["diabetes_friendly", "bp_friendly", "high_fiber", "fat_loss"],
    instructions: [
      "Wash and dry okra completely; cut into 1-inch pieces.",
      "Sauté sliced onions and minced garlic in 1 tsp oil until translucent.",
      "Add okra and cook uncovered on medium flame for 10-12 mins until crisp and non-sticky. Finish with amchur."
    ]
  },
  {
    id: "dish-mushroom-matar",
    name: "Mushroom Matar Masala with Phulkas",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 18,
    difficulty: "Easy",
    description: "Earthy sliced button mushrooms and sweet green peas simmered in a light, spiced tomato-onion gravy.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: ["gluten"],
    essential_ingredients: ["mushroom", "peas", "onion", "tomato"],
    optional_ingredients: ["garlic", "ginger", "wheat flour", "atta", "coriander"],
    default_serving_size: "1.5 katori (200g) sabzi + 2 phulkas",
    default_serving_grams: 260,
    calories: 290,
    protein_g: 13.0,
    carbs_g: 48.0,
    fat_g: 5.5,
    fiber_g: 9.0,
    sodium_mg: 290,
    glycemic_index: "low",
    medical_tags: ["diabetes_friendly", "bp_friendly", "low_calorie", "fat_loss"],
    instructions: [
      "Sauté chopped onions and ginger-garlic paste in 1 tsp oil until light brown.",
      "Add tomato puree, turmeric, and coriander powder; cook until thick.",
      "Add sliced mushrooms and green peas with 1/2 cup water; simmer for 6 minutes."
    ]
  },

  // =========================================================================
  // 5. EGGS & POULTRY & SEAFOOD (NON-VEGETARIAN)
  // =========================================================================
  {
    id: "dish-egg-bhurji",
    name: "Street-Style Masala Egg Bhurji with Whole Wheat Toast",
    regional_cuisine: "Pan-Indian",
    meal_types: ["breakfast", "dinner"],
    prep_time_minutes: 10,
    difficulty: "Easy",
    description: "Fluffy scrambled farm eggs cooked with finely chopped onions, tomatoes, green chilies, and fresh cilantro, served with toasted whole wheat bread.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["eggs", "gluten"],
    essential_ingredients: ["egg", "eggs", "onion", "tomato"],
    optional_ingredients: ["bread", "toast", "roti", "green chili", "coriander"],
    default_serving_size: "3 eggs scrambled + 2 whole wheat toasts or rotis",
    default_serving_grams: 240,
    calories: 380,
    protein_g: 22.5,
    carbs_g: 32.0,
    fat_g: 18.0,
    fiber_g: 4.5,
    sodium_mg: 340,
    glycemic_index: "low",
    medical_tags: ["high_protein", "muscle_gain", "diabetes_friendly"],
    instructions: [
      "Crack 3 eggs into a bowl with a pinch of salt and black pepper; whisk lightly.",
      "Sauté chopped onions and green chilies in 1 tsp oil until translucent; add diced tomatoes.",
      "Pour whisked eggs into the pan; stir continuously on low heat for 2-3 minutes until soft curds form. Serve warm."
    ]
  },
  {
    id: "dish-egg-curry",
    name: "Dhaba-Style Spiced Egg Curry with Steamed Rice",
    regional_cuisine: "Pan-Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Hard-boiled eggs shallow-fried and simmered in a savory roasted onion-tomato gravy with aromatic spices.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["eggs"],
    essential_ingredients: ["egg", "eggs", "onion", "tomato"],
    optional_ingredients: ["rice", "roti", "ginger-garlic", "coriander"],
    default_serving_size: "2 eggs in gravy + 1 cup rice or 2 rotis",
    default_serving_grams: 280,
    calories: 370,
    protein_g: 19.5,
    carbs_g: 38.0,
    fat_g: 14.0,
    fiber_g: 4.2,
    sodium_mg: 340,
    glycemic_index: "medium",
    medical_tags: ["high_protein", "muscle_gain"],
    instructions: [
      "Boil and peel 2 eggs; prick lightly with a fork.",
      "Sauté onions and ginger-garlic in 1 tsp oil, add tomatoes and spices.",
      "Add eggs with 1 cup water, simmer for 8 mins until gravy clings to the eggs."
    ]
  },
  {
    id: "dish-boiled-egg-salad",
    name: "Boiled Egg & Cucumber Protein Salad",
    regional_cuisine: "Global Fitness",
    meal_types: ["breakfast", "snack"],
    prep_time_minutes: 8,
    difficulty: "Easy",
    description: "Sliced hard-boiled eggs tossed with crisp cucumbers, cherry tomatoes, cracked black pepper, and lemon vinaigrette.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["eggs"],
    essential_ingredients: ["egg", "eggs", "cucumber", "tomato"],
    optional_ingredients: ["onion", "lemon", "black pepper", "olive oil"],
    default_serving_size: "2 whole eggs + 1 large bowl salad (220g)",
    default_serving_grams: 220,
    calories: 210,
    protein_g: 15.0,
    carbs_g: 8.5,
    fat_g: 13.0,
    fiber_g: 2.8,
    sodium_mg: 180,
    glycemic_index: "low",
    medical_tags: ["fat_loss", "diabetes_friendly", "bp_friendly", "high_protein"],
    instructions: [
      "Boil 2 eggs for 9 minutes, cool in ice water, peel, and slice into rounds.",
      "Dice cucumber and tomato, arrange in a bowl, and top with sliced eggs.",
      "Drizzle with 1 tsp extra virgin olive oil, fresh lemon juice, and coarse black pepper."
    ]
  },
  {
    id: "dish-tawa-chicken-tikka",
    name: "Homestyle Tawa Chicken Tikka with Kachumber Salad",
    regional_cuisine: "North Indian",
    meal_types: ["snack", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Succulent chicken breast cubes marinated in hung curd, lemon juice, roasted spices, and ginger-garlic, pan-seared to juicy perfection.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: false,
    allergens: ["dairy"],
    essential_ingredients: ["chicken", "curd", "onion", "lemon"],
    optional_ingredients: ["ginger-garlic", "capsicum", "cucumber", "chaat masala"],
    default_serving_size: "180g cooked chicken tikka + 1 cup kachumber salad",
    default_serving_grams: 260,
    calories: 310,
    protein_g: 38.0,
    carbs_g: 6.0,
    fat_g: 14.0,
    fiber_g: 2.0,
    sodium_mg: 350,
    glycemic_index: "low",
    medical_tags: ["high_protein", "muscle_gain", "fat_loss", "diabetes_friendly"],
    instructions: [
      "Cut 200g boneless chicken breast into bite-sized cubes.",
      "Marinate with 2 tbsp thick curd, 1 tsp ginger-garlic paste, red chili powder, turmeric, and lemon juice for 15 mins.",
      "Sear in a non-stick pan with 1 tsp oil on high heat for 6-8 minutes, turning until charred and cooked through."
    ]
  },
  {
    id: "dish-tariwala-chicken",
    name: "Homestyle Tariwala Chicken Curry with 2 Phulkas",
    regional_cuisine: "North Indian / Punjabi",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 25,
    difficulty: "Easy",
    description: "Lean chicken cuts simmered in a light, aromatic onion-tomato thin gravy infused with whole cinnamon, cloves, and coriander.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: false,
    allergens: ["gluten"],
    essential_ingredients: ["chicken", "onion", "tomato"],
    optional_ingredients: ["ginger-garlic", "wheat flour", "atta", "roti", "coriander"],
    default_serving_size: "2 pieces chicken + 1 bowl gravy (240g) + 2 phulkas",
    default_serving_grams: 320,
    calories: 410,
    protein_g: 36.0,
    carbs_g: 36.0,
    fat_g: 13.0,
    fiber_g: 5.0,
    sodium_mg: 380,
    glycemic_index: "low",
    medical_tags: ["high_protein", "muscle_gain"],
    instructions: [
      "Sauté finely chopped onions and ginger-garlic in 1.5 tsp oil until deep golden.",
      "Add pureed tomatoes, coriander powder, turmeric, and mild red chili.",
      "Add chicken pieces; sauté for 4 mins to seal juices, then add 1.5 cups water and simmer covered for 15 mins."
    ]
  },
  {
    id: "dish-seared-fish",
    name: "Lemon & Black Pepper Pan-Seared Fish Fillet",
    regional_cuisine: "Coastal Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 15,
    difficulty: "Easy",
    description: "Fresh fish fillet rubbed with turmeric, lemon, crushed black pepper, and curry leaves, pan-seared to flaky tenderness.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: false,
    allergens: ["fish"],
    essential_ingredients: ["fish", "lemon"],
    optional_ingredients: ["onion", "garlic", "black pepper", "turmeric", "curry leaves"],
    default_serving_size: "180g seared fish fillet + 1 bowl steamed greens",
    default_serving_grams: 260,
    calories: 290,
    protein_g: 35.0,
    carbs_g: 4.5,
    fat_g: 13.0,
    fiber_g: 2.2,
    sodium_mg: 280,
    glycemic_index: "low",
    medical_tags: ["high_protein", "heart_health", "omega3", "bp_friendly"],
    instructions: [
      "Rub fish fillets with lemon juice, turmeric, black pepper, and a pinch of salt.",
      "Heat 1 tsp oil in a non-stick pan, add curry leaves and fish.",
      "Pan-fry for 3-4 minutes per side until flaky and golden. Squeeze fresh lemon on top."
    ]
  }
];

// Stemming and synonym dictionary to reliably match real-world ingredient tokens
const SYNONYMS: Record<string, string[]> = {
  egg: ["eggs", "egg", "bhurji", "anda", "omelet", "omelette"],
  oats: ["oat", "oats", "oatmeal", "rolled oats"],
  banana: ["bananas", "banana", "kela"],
  milk: ["milk", "doodh", "dairy"],
  curd: ["curd", "dahi", "yogurt", "yoghurt"],
  paneer: ["paneer", "cottage cheese"],
  soya: ["soya", "soy", "soyabean", "chunks", "meal maker"],
  chicken: ["chicken", "murgh", "poultry", "breast"],
  fish: ["fish", "machhli", "fillet", "salmon", "rohu"],
  potato: ["potato", "potatoes", "aloo", "alu", "batata"],
  onion: ["onion", "onions", "pyaz", "kanda"],
  tomato: ["tomato", "tomatoes", "tamatar"],
  spinach: ["spinach", "palak", "saag"],
  bhindi: ["bhindi", "okra", "ladyfinger"],
  rice: ["rice", "chawal", "bhaat"],
  dal: ["dal", "lentils", "lentil", "toor", "moong"],
  chana: ["chana", "chole", "chickpea", "chickpeas", "gram"],
  rajma: ["rajma", "kidney beans"],
  besan: ["besan", "gram flour", "chickpea flour"],
  poha: ["poha", "flattened rice", "aval"],
  sooji: ["sooji", "suji", "rava", "semolina"],
  bread: ["bread", "toast", "sandwich"],
  peanut: ["peanut", "peanuts", "mungfali", "groundnut", "peanut butter"],
  mushroom: ["mushroom", "mushrooms", "khumb"],
  gobi: ["gobi", "cauliflower", "patta gobi", "bandh gobi"],
  cucumber: ["cucumber", "kheera", "kakdi"],
  sprouts: ["sprouts", "sprouted moong", "ankurit"]
};

// Intelligent Matcher: Scans user ingredients against database and returns ranked matching dishes
export function matchDishesFromDatabase(
  inputString: string,
  dietaryPreference: string = "vegetarian",
  goal: string = "muscle_gain",
  userWeightKg: number = 72,
  userConditions: string[] = []
): any[] {
  const normInput = (inputString || "").toLowerCase().trim();
  const rawTokens = normInput
    .split(/[,+\s]+/)
    .map(t => t.replace(/[^a-z]/g, "").trim())
    .filter(t => t.length > 2);

  // Expand tokens with recognized synonyms
  const searchTokens = new Set<string>();
  rawTokens.forEach(token => {
    searchTokens.add(token);
    for (const [canonical, syns] of Object.entries(SYNONYMS)) {
      if (syns.some(s => token.includes(s) || s.includes(token))) {
        searchTokens.add(canonical);
        syns.forEach(s => searchTokens.add(s));
      }
    }
  });

  const tokenList = Array.from(searchTokens);
  const isVeg = dietaryPreference.toLowerCase() !== "non_vegetarian";

  // Score dishes based strictly on ingredient match
  const scoredDishes = DISH_DATABASE.filter(dish => {
    if (isVeg && !dish.is_vegetarian) return false;
    return true;
  }).map(dish => {
    let matchScore = 0;
    const matchedIngredients: string[] = [];
    const missingIngredients: string[] = [];

    // Check essential ingredients
    dish.essential_ingredients.forEach(ess => {
      const essNorm = ess.toLowerCase();
      const isMatched = tokenList.some(tok => essNorm.includes(tok) || tok.includes(essNorm));
      if (isMatched) {
        matchScore += 10;
        matchedIngredients.push(ess);
      } else {
        missingIngredients.push(ess);
      }
    });

    // Check optional ingredients
    dish.optional_ingredients.forEach(opt => {
      const optNorm = opt.toLowerCase();
      const isMatched = tokenList.some(tok => optNorm.includes(tok) || tok.includes(optNorm));
      if (isMatched) {
        matchScore += 4;
        matchedIngredients.push(opt);
      }
    });

    // Name match bonus
    const nameNorm = dish.name.toLowerCase();
    if (tokenList.some(tok => nameNorm.includes(tok))) {
      matchScore += 15;
    }

    // Only apply goal bonuses IF the dish actually matched at least 1 ingredient!
    if (matchScore > 0 || tokenList.length === 0) {
      if (goal.includes("muscle") && dish.protein_g >= 18) matchScore += 3;
      if (goal.includes("loss") && dish.calories <= 380) matchScore += 3;
      if (userConditions.includes("prediabetes") && dish.glycemic_index === "low") matchScore += 2;
    }

    return {
      dish,
      score: matchScore,
      matchedIngredients: Array.from(new Set(matchedIngredients)),
      missingIngredients: Array.from(new Set(missingIngredients)).slice(0, 3)
    };
  });

  // Sort descending by match score
  scoredDishes.sort((a, b) => b.score - a.score);

  // If user listed ingredients, only take dishes with score > 0 first
  let candidates = scoredDishes.filter(d => d.score > 0);

  // If very few dishes matched, complement with top goal-aligned dishes so user always has 8+ options
  if (candidates.length < 8) {
    const existingIds = new Set(candidates.map(c => c.dish.id));
    const extra = scoredDishes.filter(d => !existingIds.has(d.dish.id)).slice(0, 8 - candidates.length);
    candidates = [...candidates, ...extra];
  }

  // Take top 8-10 dishes
  const finalPool = candidates.slice(0, 8);

  // Format dishes for the UI and flag the ONE TOP RECOMMENDATION
  return finalPool.map(({ dish, matchedIngredients, missingIngredients }, index) => {
    const isTopRec = index === 0;

    let recommendationReason = "";
    if (isTopRec) {
      recommendationReason = `🏆 #1 Top Match: Best aligns with your ${goal.replace(/_/g, " ")} goal (${dish.protein_g}g protein, ${dish.calories} kcal) while utilizing your available ingredients: ${matchedIngredients.join(", ") || dish.essential_ingredients.slice(0, 3).join(", ")}.`;
    }

    return {
      id: dish.id,
      dish_name: dish.name,
      is_vegetarian: dish.is_vegetarian,
      prep_time_minutes: dish.prep_time_minutes,
      difficulty: dish.difficulty,
      is_top_recommendation: isTopRec,
      recommendation_reason: recommendationReason,
      ingredients_used: matchedIngredients.length > 0 ? matchedIngredients : dish.essential_ingredients.slice(0, 3),
      missing_ingredients: missingIngredients,
      portion_guidance: {
        serving_size: dish.default_serving_size,
        household_measure: dish.default_serving_size.split("+")[0]?.trim() || "1 serving",
        reasoning: `Portioned specifically for your ${userWeightKg}kg body weight to support your ${goal.replace(/_/g, " ")} goal. ${dish.glycemic_index === 'low' ? 'Low glycemic response prevents insulin spikes.' : 'Balanced macros ensure steady energy.'}`
      },
      nutrition: {
        calories: dish.calories,
        protein_g: dish.protein_g,
        carbs_g: dish.carbs_g,
        fat_g: dish.fat_g,
        fiber_g: dish.fiber_g,
        sodium_mg: dish.sodium_mg
      },
      goal_impact: {
        goal_name: goal.replace(/_/g, " "),
        summary: `Contributes ${dish.protein_g}g protein and ${dish.fiber_g}g dietary fiber to achieve your ${goal.replace(/_/g, " ")} target.`,
        medical_suitability: "ideal",
        medical_notes: `Clinically suited for ${userConditions.join(", ") || "metabolic health"}. Sodium: ${dish.sodium_mg}mg.`
      },
      quick_steps: dish.instructions
    };
  });
}
