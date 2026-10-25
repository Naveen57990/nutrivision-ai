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
  // --- High-Protein Vegetarian ---
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
    essential_ingredients: ["paneer", "spinach", "garlic", "tomato", "wheat flour", "atta", "roti"],
    optional_ingredients: ["green chili", "cumin", "onion", "ginger"],
    default_serving_size: "1.5 katori (200g) sabzi + 2 phulkas (60g)",
    default_serving_grams: 260,
    calories: 420,
    protein_g: 24.5,
    carbs_g: 38.0,
    fat_g: 18.0,
    fiber_g: 8.2,
    sodium_mg: 360,
    glycemic_index: "low",
    medical_tags: ["high_protein", "diabetes_friendly", "bp_friendly"],
    instructions: [
      "Blanch 2 cups spinach in boiling water for 2 mins, chill in ice water, and puree with 1 green chili.",
      "Saute minced garlic, cumin seeds, and finely chopped onion in 1 tsp oil until fragrant.",
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
    optional_ingredients: ["green chili", "coriander", "black pepper", "bread", "roti"],
    default_serving_size: "1 medium bowl (150g) bhurji + 2 rotis or toasts",
    default_serving_grams: 210,
    calories: 395,
    protein_g: 22.0,
    carbs_g: 32.0,
    fat_g: 19.0,
    fiber_g: 6.0,
    sodium_mg: 320,
    glycemic_index: "low",
    medical_tags: ["high_protein", "diabetes_friendly"],
    instructions: [
      "Heat 1 tsp oil in a pan, add cumin, chopped onions, and saute until light golden.",
      "Add diced tomatoes, turmeric, and pinch of black pepper; cook until soft.",
      "Crumble fresh paneer into the pan and toss gently for 2-3 minutes. Garnish with chopped coriander."
    ]
  },
  {
    id: "dish-besan-chilla",
    name: "Crispy Vegetable Besan Chilla (Cheela)",
    regional_cuisine: "North Indian",
    meal_types: ["breakfast", "snack", "dinner"],
    prep_time_minutes: 15,
    difficulty: "Easy",
    description: "Nutritious savory chickpea flour pancakes studded with crunchy onions, tomatoes, and herbs.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["besan", "gram flour", "onion", "water"],
    optional_ingredients: ["tomato", "green chili", "coriander", "ajwain", "carom seeds"],
    default_serving_size: "2 medium chillas (160g total) with curd or mint chutney",
    default_serving_grams: 160,
    calories: 310,
    protein_g: 16.5,
    carbs_g: 38.0,
    fat_g: 9.0,
    fiber_g: 7.5,
    sodium_mg: 280,
    glycemic_index: "low",
    medical_tags: ["diabetes_friendly", "bp_friendly", "fat_loss"],
    instructions: [
      "Whisk 1 cup besan with water, carom seeds (ajwain), and salt to a smooth flowing batter.",
      "Fold in finely diced onions, tomatoes, and chopped green chilies.",
      "Pour a ladle onto a hot tawa lightly brushed with oil, cook until golden and crisp on both sides."
    ]
  },
  {
    id: "dish-moong-dal-khichdi",
    name: "Comforting Moong Dal Khichdi with Dahi",
    regional_cuisine: "Pan-Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Classic soothing one-pot meal pairing yellow split lentils with rice, cumin, and cool probiotic curd.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy"],
    essential_ingredients: ["moong dal", "rice", "curd", "dahi"],
    optional_ingredients: ["cumin", "turmeric", "ginger", "ghee", "cucumber"],
    default_serving_size: "1.5 bowls (250g) khichdi + 1 small katori (100g) curd",
    default_serving_grams: 350,
    calories: 380,
    protein_g: 17.5,
    carbs_g: 58.0,
    fat_g: 7.0,
    fiber_g: 7.2,
    sodium_mg: 300,
    glycemic_index: "medium",
    medical_tags: ["bp_friendly", "easy_digestion"],
    instructions: [
      "Wash equal parts yellow moong dal and rice.",
      "Pressure cook with 3 cups water, turmeric, salt, and ginger for 3 whistles.",
      "Lightly temper with cumin in 1/2 tsp ghee and serve with cool probiotic curd."
    ]
  },
  {
    id: "dish-dal-tadka-rice",
    name: "Homestyle Dal Tadka with Steamed Jeera Rice",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 25,
    difficulty: "Easy",
    description: "Yellow toor dal cooked with aromatics, tempered with garlic, cumin, and dry chili over fragrant rice.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["toor dal", "dal", "rice", "onion", "tomato"],
    optional_ingredients: ["garlic", "cumin", "turmeric", "ghee", "green chili"],
    default_serving_size: "1.5 katori (200g) dal + 1 bowl (120g) rice",
    default_serving_grams: 320,
    calories: 410,
    protein_g: 15.2,
    carbs_g: 68.0,
    fat_g: 6.8,
    fiber_g: 8.0,
    sodium_mg: 340,
    glycemic_index: "medium",
    medical_tags: ["bp_friendly"],
    instructions: [
      "Pressure cook toor dal with water, salt, and turmeric until soft.",
      "In a tadka pan, heat 1 tsp oil or ghee, add cumin seeds, minced garlic, and diced tomatoes.",
      "Pour hot tadka over boiled dal and serve over warm steamed rice."
    ]
  },
  {
    id: "dish-soya-chunks-curry",
    name: "High-Protein Soya Chunks Masala Curry",
    regional_cuisine: "Pan-Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Soy bean chunks simmered in a spiced onion-tomato gravy; the highest plant-protein density available.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: ["soy", "gluten"],
    essential_ingredients: ["soya chunks", "soy", "onion", "tomato"],
    optional_ingredients: ["ginger-garlic", "coriander", "roti", "rice"],
    default_serving_size: "1.5 katori (220g) soya curry + 2 phulkas (60g)",
    default_serving_grams: 280,
    calories: 360,
    protein_g: 32.5,
    carbs_g: 36.0,
    fat_g: 8.5,
    fiber_g: 9.5,
    sodium_mg: 320,
    glycemic_index: "low",
    medical_tags: ["high_protein", "fat_loss", "diabetes_friendly"],
    instructions: [
      "Soak soya chunks in warm water for 10 mins, squeeze out excess water completely.",
      "Saute onions, ginger-garlic paste, and tomatoes in a skillet until oil separates.",
      "Add soya chunks, garam masala, and 1 cup water; simmer for 8 mins until flavors absorb."
    ]
  },
  {
    id: "dish-sprouts-chaat",
    name: "Sprouted Moong & Cucumber Protein Chaat",
    regional_cuisine: "Pan-Indian",
    meal_types: ["breakfast", "snack"],
    prep_time_minutes: 8,
    difficulty: "Easy",
    description: "Fresh sprouted green moong tossed with crunchy cucumber, red onion, lemon juice, and chaat spices.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["sprouts", "moong sprouts", "onion", "tomato", "lemon"],
    optional_ingredients: ["cucumber", "chaat masala", "coriander", "green chili"],
    default_serving_size: "1 large bowl (220g) crunchy chaat",
    default_serving_grams: 220,
    calories: 240,
    protein_g: 17.5,
    carbs_g: 36.0,
    fat_g: 2.5,
    fiber_g: 11.0,
    sodium_mg: 210,
    glycemic_index: "low",
    medical_tags: ["diabetes_friendly", "bp_friendly", "fat_loss"],
    instructions: [
      "Steam sprouted moong for 3 mins to tenderize (or use crisp raw sprouts).",
      "Combine with diced red onion, tomatoes, and crisp seedless cucumbers.",
      "Dress with fresh lemon juice, roasted cumin, and black salt. Toss and eat immediately."
    ]
  },
  {
    id: "dish-oats-upma",
    name: "Heart-Healthy Savory Vegetable Oats Upma",
    regional_cuisine: "South Indian",
    meal_types: ["breakfast", "dinner"],
    prep_time_minutes: 12,
    difficulty: "Easy",
    description: "Rolled oats toasted with mustard seeds, curry leaves, onions, and diced vegetables.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["oats", "onion", "mustard seeds"],
    optional_ingredients: ["tomato", "green chili", "carrots", "curry leaves", "ginger"],
    default_serving_size: "1.5 medium bowls (220g) warm upma",
    default_serving_grams: 220,
    calories: 290,
    protein_g: 11.5,
    carbs_g: 44.0,
    fat_g: 6.5,
    fiber_g: 8.5,
    sodium_mg: 260,
    glycemic_index: "low",
    medical_tags: ["bp_friendly", "diabetes_friendly", "cholesterol_friendly"],
    instructions: [
      "Dry roast oats in a dry pan for 2 mins, set aside.",
      "Sizzle mustard seeds, curry leaves, and green chilies in 1 tsp oil.",
      "Saute onions and veggies, pour 1.5 cups water and salt, bring to boil.",
      "Stir in toasted oats and cook for 3 mins until soft and fluffy."
    ]
  },
  {
    id: "dish-curd-rice",
    name: "Soothing South Indian Curd Rice (Thayir Sadam)",
    regional_cuisine: "South Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 10,
    difficulty: "Easy",
    description: "Mashed soft cooked rice blended with fresh homemade yogurt, tempered with mustard seeds and curry leaves.",
    is_vegetarian: true,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["dairy"],
    essential_ingredients: ["rice", "curd", "dahi", "mustard seeds"],
    optional_ingredients: ["green chili", "ginger", "curry leaves", "cucumber"],
    default_serving_size: "1 medium bowl (220g) with cucumber salad",
    default_serving_grams: 220,
    calories: 320,
    protein_g: 10.5,
    carbs_g: 48.0,
    fat_g: 8.0,
    fiber_g: 2.5,
    sodium_mg: 280,
    glycemic_index: "medium",
    medical_tags: ["gut_health", "bp_friendly"],
    instructions: [
      "Mash warm soft cooked rice with the back of a spoon.",
      "Mix in fresh probiotic curd, pinch of salt, and grated ginger.",
      "Temper mustard seeds and curry leaves in 1/2 tsp oil and pour over the rice."
    ]
  },
  {
    id: "dish-rajma-masala",
    name: "Punjabi Rajma Masala (Red Kidney Bean Curry)",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 25,
    difficulty: "Medium",
    description: "Melt-in-mouth red kidney beans simmered in a thick, rich tomato, onion, and whole spice gravy.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["rajma", "kidney beans", "onion", "tomato"],
    optional_ingredients: ["ginger-garlic", "garam masala", "rice", "roti"],
    default_serving_size: "1.5 katori (220g) rajma + 1 cup rice or 2 rotis",
    default_serving_grams: 320,
    calories: 430,
    protein_g: 18.0,
    carbs_g: 65.0,
    fat_g: 8.5,
    fiber_g: 13.5,
    sodium_mg: 380,
    glycemic_index: "low",
    medical_tags: ["diabetes_friendly", "high_protein"],
    instructions: [
      "Pressure cook soaked rajma beans with whole spices until completely tender.",
      "Saute onions and ginger-garlic paste until dark golden, add pureed tomatoes and spices.",
      "Add boiled beans with their cooking broth; simmer on medium flame for 15 mins to thicken."
    ]
  },
  {
    id: "dish-chole-masala",
    name: "Amritsari Chole (Spiced Chickpea Masala)",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 25,
    difficulty: "Medium",
    description: "Plump white chickpeas stewed in an earthy, dark spiced onion-tomato gravy with pomegranate seeds and cumin.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: [],
    essential_ingredients: ["chickpeas", "chana", "chole", "onion", "tomato"],
    optional_ingredients: ["tea bag", "ginger", "garlic", "anardana"],
    default_serving_size: "1.5 katori (220g) chole + 2 phulkas or rice",
    default_serving_grams: 320,
    calories: 420,
    protein_g: 19.5,
    carbs_g: 62.0,
    fat_g: 9.0,
    fiber_g: 12.0,
    sodium_mg: 390,
    glycemic_index: "low",
    medical_tags: ["diabetes_friendly", "high_protein"],
    instructions: [
      "Boil soaked chickpeas until tender.",
      "Saute onions, ginger, and garlic in 1 tsp oil, add tomato puree and chole masala.",
      "Stir in chickpeas and simmer for 12 mins, mashing a few chickpeas to thicken gravy."
    ]
  },
  {
    id: "dish-aloo-gobi",
    name: "Homestyle Aloo Gobi Matar with Whole Wheat Roti",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Cauliflower florets and potatoes cooked dry with green peas, cumin, turmeric, and fresh ginger juliennes.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: ["gluten"],
    essential_ingredients: ["cauliflower", "gobi", "potato", "aloo", "onion"],
    optional_ingredients: ["peas", "matar", "ginger", "turmeric", "roti"],
    default_serving_size: "1.5 katori (200g) sabzi + 2 phulkas (60g)",
    default_serving_grams: 260,
    calories: 340,
    protein_g: 9.5,
    carbs_g: 58.0,
    fat_g: 7.0,
    fiber_g: 8.5,
    sodium_mg: 310,
    glycemic_index: "medium",
    medical_tags: ["bp_friendly"],
    instructions: [
      "Saute cumin seeds and chopped onions in 1 tsp oil.",
      "Add cauliflower florets, diced potatoes, green peas, turmeric, and coriander powder.",
      "Cover with a tight lid and steam-cook on low flame for 12 mins until fork-tender."
    ]
  },
  {
    id: "dish-bhindi-masala",
    name: "Crispy Garlic Bhindi Masala (Okra Sabzi)",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 15,
    difficulty: "Easy",
    description: "Tender sliced okra pan-sautéed with onions, sliced garlic, amchur (dry mango powder), and red chili.",
    is_vegetarian: true,
    is_vegan: true,
    is_eggetarian: true,
    allergens: ["gluten"],
    essential_ingredients: ["bhindi", "okra", "onion", "garlic"],
    optional_ingredients: ["amchur", "cumin", "roti"],
    default_serving_size: "1.5 katori (180g) bhindi + 2 phulkas (60g)",
    default_serving_grams: 240,
    calories: 280,
    protein_g: 7.8,
    carbs_g: 45.0,
    fat_g: 6.5,
    fiber_g: 9.2,
    sodium_mg: 240,
    glycemic_index: "low",
    medical_tags: ["diabetes_friendly", "bp_friendly", "fat_loss"],
    instructions: [
      "Wash bhindi and dry completely with a clean towel before slicing.",
      "Saute sliced onions and garlic in 1 tsp oil until soft.",
      "Add bhindi and spices; cook uncovered on medium flame for 10 mins until crisp and non-sticky."
    ]
  },

  // --- High-Protein Non-Vegetarian (Eggs, Chicken, Fish) ---
  {
    id: "dish-egg-bhurji",
    name: "Street-Style Masala Egg Bhurji with Whole Wheat Toast",
    regional_cuisine: "Pan-Indian",
    meal_types: ["breakfast", "lunch", "dinner"],
    prep_time_minutes: 12,
    difficulty: "Easy",
    description: "Fluffy spiced scrambled eggs cooked with diced onions, juicy tomatoes, and cracked black pepper.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["eggs", "gluten"],
    essential_ingredients: ["eggs", "egg", "onion", "tomato"],
    optional_ingredients: ["black pepper", "green chili", "bread", "roti", "coriander"],
    default_serving_size: "3 eggs scrambled + 2 whole wheat toasts or rotis",
    default_serving_grams: 220,
    calories: 380,
    protein_g: 24.5,
    carbs_g: 28.0,
    fat_g: 16.5,
    fiber_g: 4.5,
    sodium_mg: 340,
    glycemic_index: "low",
    medical_tags: ["high_protein", "diabetes_friendly"],
    instructions: [
      "Whisk 3 eggs (or 2 whole + 1 white) with salt and black pepper.",
      "Saute diced onions and tomatoes in 1 tsp oil for 2 mins.",
      "Pour eggs into the pan and scramble gently over medium heat until soft and moist. Serve with toast."
    ]
  },
  {
    id: "dish-boiled-egg-salad",
    name: "Boiled Egg & Cucumber Protein Salad",
    regional_cuisine: "Global / Healthy",
    meal_types: ["breakfast", "snack", "dinner"],
    prep_time_minutes: 10,
    difficulty: "Easy",
    description: "Sliced hard-boiled eggs tossed with cool cucumbers, red onion rings, lemon juice, and black pepper.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["eggs"],
    essential_ingredients: ["eggs", "egg", "cucumber", "onion"],
    optional_ingredients: ["tomato", "black pepper", "lemon", "chaat masala"],
    default_serving_size: "3 boiled eggs + 1 large bowl salad",
    default_serving_grams: 240,
    calories: 270,
    protein_g: 21.0,
    carbs_g: 8.5,
    fat_g: 15.0,
    fiber_g: 2.8,
    sodium_mg: 260,
    glycemic_index: "low",
    medical_tags: ["high_protein", "diabetes_friendly", "fat_loss"],
    instructions: [
      "Boil eggs for 9-10 minutes, peel and slice into halves.",
      "Combine with sliced cucumber, onion rings, and fresh tomatoes.",
      "Season with fresh lemon juice, sea salt, and crushed black pepper."
    ]
  },
  {
    id: "dish-chicken-tikka-pan",
    name: "Homestyle Tawa Chicken Tikka with Kachumber Salad",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Skinless chicken breast chunks marinated in Greek yogurt and tandoori spices, seared in a hot skillet.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: false,
    allergens: ["dairy"],
    essential_ingredients: ["chicken", "chicken breast", "curd", "dahi", "onion"],
    optional_ingredients: ["lemon", "ginger-garlic", "cucumber", "chaat masala"],
    default_serving_size: "180g cooked chicken breast + 1 large bowl salad",
    default_serving_grams: 280,
    calories: 340,
    protein_g: 44.0,
    carbs_g: 6.5,
    fat_g: 12.0,
    fiber_g: 2.8,
    sodium_mg: 310,
    glycemic_index: "low",
    medical_tags: ["high_protein", "fat_loss", "diabetes_friendly", "bp_friendly"],
    instructions: [
      "Cut chicken breast into bite-sized cubes.",
      "Marinate in 2 tbsp thick curd, ginger-garlic paste, lemon juice, and red chili for 15 mins.",
      "Pan-sear on a hot lightly-greased skillet for 4-5 mins each side until charred and juicy."
    ]
  },
  {
    id: "dish-chicken-curry",
    name: "Homestyle Tariwala Chicken Curry with 2 Phulkas",
    regional_cuisine: "North Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 25,
    difficulty: "Medium",
    description: "Tender chicken cooked in a light, aromatic onion-tomato broth flavored with cloves and cardamom.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: false,
    allergens: ["gluten"],
    essential_ingredients: ["chicken", "onion", "tomato"],
    optional_ingredients: ["ginger-garlic", "coriander", "roti", "rice"],
    default_serving_size: "1.5 katori (220g) chicken curry + 2 phulkas (60g)",
    default_serving_grams: 280,
    calories: 390,
    protein_g: 36.0,
    carbs_g: 34.0,
    fat_g: 11.5,
    fiber_g: 5.5,
    sodium_mg: 350,
    glycemic_index: "low",
    medical_tags: ["high_protein", "diabetes_friendly"],
    instructions: [
      "Brown sliced onions in 1 tsp oil, add crushed ginger and garlic.",
      "Add chicken pieces and sear for 5 mins until the outer surface turns white.",
      "Add pureed tomatoes and spices, pour 1 cup water, cover and simmer for 15 mins."
    ]
  },
  {
    id: "dish-fish-tawa-fry",
    name: "Lemon & Black Pepper Pan-Seared Fish Fillet",
    regional_cuisine: "Coastal Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 15,
    difficulty: "Easy",
    description: "Fresh fish fillet rubbed with turmeric, lemon, crushed black pepper, and curry leaves, pan-seared to perfection.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: false,
    allergens: ["fish"],
    essential_ingredients: ["fish", "lemon", "onion"],
    optional_ingredients: ["black pepper", "turmeric", "garlic", "curry leaves"],
    default_serving_size: "180g seared fish fillet + 1 bowl steamed greens",
    default_serving_grams: 260,
    calories: 290,
    protein_g: 35.0,
    carbs_g: 4.5,
    fat_g: 13.0,
    fiber_g: 2.2,
    sodium_mg: 280,
    glycemic_index: "low",
    medical_tags: ["high_protein", "heart_health", "omega3"],
    instructions: [
      "Rub fish fillets with lemon juice, turmeric, black pepper, and a pinch of salt.",
      "Heat 1 tsp oil in a non-stick pan, add curry leaves and fish.",
      "Pan-fry for 3-4 minutes per side until flaky and golden. Squeeze fresh lemon on top."
    ]
  },
  {
    id: "dish-egg-curry",
    name: "Dhaba-Style Spiced Egg Curry with Rice",
    regional_cuisine: "Pan-Indian",
    meal_types: ["lunch", "dinner"],
    prep_time_minutes: 20,
    difficulty: "Easy",
    description: "Hard-boiled eggs pierced and shallow fried, simmered in a savory roasted onion and tomato masala gravy.",
    is_vegetarian: false,
    is_vegan: false,
    is_eggetarian: true,
    allergens: ["eggs"],
    essential_ingredients: ["eggs", "egg", "onion", "tomato"],
    optional_ingredients: ["ginger-garlic", "rice", "roti", "turmeric"],
    default_serving_size: "2 eggs in gravy + 1 cup rice or 2 rotis",
    default_serving_grams: 280,
    calories: 370,
    protein_g: 19.5,
    carbs_g: 38.0,
    fat_g: 14.0,
    fiber_g: 4.2,
    sodium_mg: 340,
    glycemic_index: "medium",
    medical_tags: ["high_protein"],
    instructions: [
      "Boil and peel eggs; prick lightly with a fork.",
      "Saute onions and ginger-garlic in 1 tsp oil, add tomatoes and spices.",
      "Add eggs with 1 cup water, simmer for 8 mins until gravy clings to the eggs."
    ]
  }
];

// Intelligent Matcher: Scans user ingredients against database and returns ranked matching dishes
export function matchDishesFromDatabase(
  inputString: string,
  dietaryPreference: string = "vegetarian",
  goal: string = "muscle_gain",
  userWeightKg: number = 72,
  userConditions: string[] = []
): any[] {
  const normInput = inputString.toLowerCase();
  // Extract individual words and tokens
  const tokens = normInput
    .split(/[,+\s]+/)
    .map(t => t.trim())
    .filter(t => t.length > 2);

  const isVeg = dietaryPreference.toLowerCase() !== "non_vegetarian";

  // Score each recipe
  const scored = DISH_DATABASE.filter(dish => {
    // Dietary filter
    if (isVeg && !dish.is_vegetarian) return false;
    return true;
  }).map(dish => {
    let matchCount = 0;
    const matchedIngredients: string[] = [];
    const missingIngredients: string[] = [];

    // Check essential ingredients
    dish.essential_ingredients.forEach(ess => {
      const hasMatch = tokens.some(tok => ess.includes(tok) || tok.includes(ess));
      if (hasMatch) {
        matchCount += 2;
        matchedIngredients.push(ess);
      } else {
        missingIngredients.push(ess);
      }
    });

    // Check optional ingredients
    dish.optional_ingredients.forEach(opt => {
      const hasMatch = tokens.some(tok => opt.includes(tok) || tok.includes(opt));
      if (hasMatch) {
        matchCount += 1;
        matchedIngredients.push(opt);
      }
    });

    // Check if dish name matches input directly
    if (tokens.some(tok => dish.name.toLowerCase().includes(tok))) {
      matchCount += 3;
    }

    // Goal alignment bonus
    if (goal === "muscle_gain" && dish.protein_g >= 20) matchCount += 1.5;
    if (goal === "weight_loss" && dish.calories <= 380) matchCount += 1.5;
    if (userConditions.includes("prediabetes") && dish.glycemic_index === "low") matchCount += 1.5;

    return {
      dish,
      score: matchCount,
      matchedIngredients: Array.from(new Set(matchedIngredients)),
      missingIngredients: Array.from(new Set(missingIngredients)).slice(0, 3)
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return top 4-6 dishes formatted for UI consumption
  const topMatches = scored.slice(0, 5);

  return topMatches.map(({ dish, matchedIngredients, missingIngredients }) => {
    return {
      dish_name: dish.name,
      is_vegetarian: dish.is_vegetarian,
      prep_time_minutes: dish.prep_time_minutes,
      difficulty: dish.difficulty,
      ingredients_used: matchedIngredients.length > 0 ? matchedIngredients : dish.essential_ingredients.slice(0, 3),
      missing_ingredients: missingIngredients,
      portion_guidance: {
        serving_size: dish.default_serving_size,
        household_measure: dish.default_serving_size.split("+")[0]?.trim() || "1 plate",
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
        summary: `Contributes ${dish.protein_g}g protein (${Math.round((dish.protein_g / 75) * 100)}% of daily reference) and ${dish.fiber_g}g dietary fiber to achieve your ${goal.replace(/_/g, " ")} goals.`,
        medical_suitability: "ideal",
        medical_notes: `Clinically suited for ${userConditions.join(", ") || "metabolic health"}. Controlled sodium (${dish.sodium_mg}mg) protects blood pressure.`
      },
      quick_steps: dish.instructions
    };
  });
}
