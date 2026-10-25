import pytest

def test_api_health_check(client):
    res = client.get("/healthz")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_api_demo_login(client):
    res = client.post("/api/auth/demo-login")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@nutrivision.health"

def test_api_food_search(client):
    res = client.get("/api/foods?q=roti")
    assert res.status_code == 200
    items = res.json()
    assert len(items) > 0
    assert any("roti" in i["name"].lower() for i in items)

def test_api_nutrition_evaluate(client):
    # Search for an item first
    food_res = client.get("/api/foods?q=rice")
    assert food_res.status_code == 200
    food_id = food_res.json()[0]["id"]

    payload = [
        {
            "food_item_id": food_id,
            "food_name": "Steamed White Rice",
            "serving_quantity": 1.0,
            "serving_unit": "bowl",
            "weight_grams": 150.0
        }
    ]
    res = client.post("/api/nutrition/evaluate-meal", json=payload)
    assert res.status_code == 200
    report = res.json()
    assert "nutrients" in report
    assert report["nutrients"]["calories"] > 0
    assert "suitability" in report

def test_api_assistant_chat(client):
    res = client.post("/api/assistant/chat", json={"message": "How much protein did I have today?"})
    assert res.status_code == 200
    data = res.json()
    assert "content" in data
    assert "protein" in data["content"].lower()

def test_api_data_export(client):
    # Login demo user
    login_res = client.post("/api/auth/demo-login")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/data/export", headers=headers)
    assert res.status_code == 200
    export_data = res.json()
    assert "user_info" in export_data
    assert "logged_meals" in export_data
    assert export_data["total_meals_logged"] >= 0
