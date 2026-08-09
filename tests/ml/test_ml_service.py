"""Integration tests for the Restaurant_POS_ML FastAPI service."""


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["database_connected"] is True
    assert body["orders_in_db"] > 0


def test_forecast_returns_trained_series(client):
    r = client.get("/forecast?horizon_days=7")
    assert r.status_code == 200
    d = r.json()
    assert d["trained"] is True
    assert len(d["forecast"]) == 7
    assert all("predicted_revenue" in f for f in d["forecast"])


def test_forecast_horizon_bounds(client):
    # horizon must be within 1..60
    assert client.get("/forecast?horizon_days=0").status_code == 422
    assert client.get("/forecast?horizon_days=61").status_code == 422


def test_demand_predictions(client):
    r = client.get("/demand?top=5")
    assert r.status_code == 200
    d = r.json()
    assert d["trained"] is True
    assert len(d["predictions"]) >= 1
    top = d["predictions"][0]
    assert "predicted_quantity" in top


def test_popular_dishes(client):
    r = client.get("/popular?limit=3")
    assert r.status_code == 200
    dishes = r.json()["dishes"]
    assert len(dishes) >= 1
    # Butter Naan is ordered twice per order, so it should be popular.
    names = [x["name"] for x in dishes]
    assert "Butter Naan" in names


def test_recommend_association(client):
    r = client.post("/recommend", json={"items": ["Butter Chicken"], "limit": 3})
    assert r.status_code == 200
    d = r.json()
    assert d["trained"] is True
    recs = [x["name"] for x in d["recommendations"]]
    # Butter Naan always co-occurs with Butter Chicken in the seed.
    assert "Butter Naan" in recs


def test_recommend_empty_cart_falls_back_to_popularity(client):
    r = client.post("/recommend", json={"items": [], "limit": 3})
    assert r.status_code == 200
    d = r.json()
    assert d["basis"] in ("popularity", "association")
    assert len(d["recommendations"]) >= 1
