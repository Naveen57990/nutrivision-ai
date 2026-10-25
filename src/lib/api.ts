const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface AIConfig {
  provider: "auto" | "openai" | "gemini" | "local" | "mock";
  openaiApiKey?: string;
  openaiModel?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  localLlmUrl?: string;
  localLlmModel?: string;
}

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("nutrivision_token");
    }
    return null;
  }

  public static setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("nutrivision_token", token);
    }
  }

  public static clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("nutrivision_token");
      localStorage.removeItem("nutrivision_user");
    }
  }

  public static getAIConfig(): AIConfig {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("nutrivision_ai_config");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch {}
    }
    return {
      provider: "auto",
      openaiModel: "gpt-4o",
      geminiModel: "gemini-1.5-flash",
      localLlmUrl: "http://localhost:11434",
      localLlmModel: "llama3.2-vision",
    };
  }

  public static setAIConfig(config: AIConfig) {
    if (typeof window !== "undefined") {
      localStorage.setItem("nutrivision_ai_config", JSON.stringify(config));
    }
  }

  public static async testAIConnection(overrideConfig?: Partial<AIConfig>) {
    const active = { ...this.getAIConfig(), ...(overrideConfig || {}) };
    return this.request<any>("/api/ai-test", {
      method: "POST",
      body: JSON.stringify(active),
    });
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const aiConfig = this.getAIConfig();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Attach AI integration credentials and routing headers
    if (aiConfig.provider) headers["x-ai-provider"] = aiConfig.provider;
    if (aiConfig.openaiApiKey) headers["x-openai-key"] = aiConfig.openaiApiKey;
    if (aiConfig.openaiModel) headers["x-openai-model"] = aiConfig.openaiModel;
    if (aiConfig.geminiApiKey) headers["x-gemini-key"] = aiConfig.geminiApiKey;
    if (aiConfig.geminiModel) headers["x-gemini-model"] = aiConfig.geminiModel;
    if (aiConfig.localLlmUrl) headers["x-local-llm-url"] = aiConfig.localLlmUrl;
    if (aiConfig.localLlmModel) headers["x-local-llm-model"] = aiConfig.localLlmModel;

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorDetail = "An error occurred with your request.";
      try {
        const errorJson = await res.json();
        errorDetail = errorJson.detail || errorJson.error || errorJson.message || errorDetail;
      } catch {
        // Ignored
      }
      throw new Error(errorDetail);
    }

    return res.json();
  }

  // --- Auth ---
  static async register(data: { email: string; password: string; full_name: string }) {
    const res = await this.request<{ access_token: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
      if (typeof window !== "undefined") {
        localStorage.setItem("nutrivision_user", JSON.stringify(res.user));
      }
    }
    return res;
  }

  static async login(data: { username?: string; email?: string; password: string }) {
    const email = data.email || data.username || "demo@nutrivision.health";
    const res = await this.request<{ access_token: string; user: any }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: data.password }),
    });
    if (res.access_token) {
      this.setToken(res.access_token);
      if (typeof window !== "undefined") {
        localStorage.setItem("nutrivision_user", JSON.stringify(res.user));
      }
    }
    return res;
  }

  static async demoLogin() {
    return this.login({ email: "demo@nutrivision.health", password: "demopassword" });
  }

  static async getProfile() {
    return this.request<any>("/api/auth/me");
  }

  static async getMe() {
    return this.getProfile();
  }

  static async createProfile(profileData: any) {
    return this.request<any>("/api/profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    });
  }

  static async updateProfile(profileData: any) {
    return this.request<any>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // --- Foods ---
  static async searchFoods(query: string = "", category: string = "", preference: string = "") {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (category) params.append("category", category);
    if (preference) params.append("preference", preference);
    return this.request<any[]>(`/api/foods?${params.toString()}`);
  }

  static async getFoodCategories() {
    return this.request<{ categories: string[] }>("/api/foods/categories");
  }

  // --- Scanner ---
  static async scanImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<any>("/api/scan", {
      method: "POST",
      body: formData,
    });
  }

  static async getDemoScenarios() {
    return this.request<{ scenarios: any[] }>("/api/scan/demo-scenarios");
  }

  // --- Nutrition ---
  static async calculatePortion(data: { food_item_id: number; weight_grams?: number; servings?: number; added_oil_tsp?: number; added_sugar_tsp?: number }) {
    return this.request<any>("/api/nutrition/calculate-portion", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async evaluateMeal(items: any[], mealType: string = "Meal") {
    return this.request<any>(`/api/nutrition/evaluate-meal?meal_type=${encodeURIComponent(mealType)}`, {
      method: "POST",
      body: JSON.stringify(items),
    });
  }

  // --- Available Food ("What Can I Eat Right Now?") ---
  static async getPantry() {
    return this.request<{ pantry: any[] }>("/api/available-food/pantry");
  }

  static async addPantryItem(ingredient_name: string, category: string = "Pantry") {
    const params = new URLSearchParams({ ingredient_name, category });
    return this.request<any>(`/api/available-food/pantry?${params.toString()}`, {
      method: "POST",
    });
  }

  static async deletePantryItem(id: number) {
    return this.request<any>(`/api/available-food/pantry/${id}`, {
      method: "DELETE",
    });
  }

  static async recommendAvailableMeals(ingredients: string[], maxPrepTime?: number, mealType?: string) {
    return this.request<any>("/api/available-food", {
      method: "POST",
      body: JSON.stringify({
        available_ingredients: ingredients,
        max_prep_time_minutes: maxPrepTime,
        meal_type: mealType,
      }),
    });
  }

  static async getCommonIngredients() {
    return this.request<{ staples: { name: string; category: string }[] }>("/api/available-food/common-ingredients");
  }

  // --- Meals & Tracking ---
  static async logMeal(mealData: any) {
    return this.request<any>("/api/meals", {
      method: "POST",
      body: JSON.stringify(mealData),
    });
  }

  static async getMealsForDate(dateStr?: string) {
    const endpoint = dateStr ? `/api/meals?date=${dateStr}` : "/api/meals";
    return this.request<any[]>(endpoint);
  }

  static async deleteMeal(id: number) {
    return this.request<any>(`/api/meals/${id}`, {
      method: "DELETE",
    });
  }

  static async getDailySummary(dateStr?: string) {
    const endpoint = dateStr ? `/api/meals/daily-summary?date=${dateStr}` : "/api/meals/daily-summary";
    return this.request<any>(endpoint);
  }

  static async getHistory(days: number = 7) {
    return this.request<{ trends: any[] }>(`/api/meals/history?days=${days}`);
  }

  // --- Assistant ---
  static async sendChatMessage(message: string) {
    return this.request<any>("/api/assistant", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  static async getChatHistory() {
    return this.request<{ messages: any[] }>("/api/assistant/history");
  }

  // --- Privacy & Data ---
  static async exportUserData() {
    return this.request<any>("/api/data/export");
  }

  static async deleteAccountPermanently(confirmation: string) {
    return this.request<any>(`/api/data/delete-account?confirmation=${encodeURIComponent(confirmation)}`, {
      method: "DELETE",
    });
  }
}
