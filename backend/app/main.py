from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.routers import (
    auth,
    categories,
    locations,
    products,
    purchase_orders,
    replenishment,
    stock_movements,
    stocks,
    suppliers,
    users,
)

app = FastAPI(title="Inventory API", version="1.0.0")

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for module in (
    auth,
    users,
    categories,
    locations,
    suppliers,
    products,
    stocks,
    stock_movements,
    purchase_orders,
    replenishment,
):
    app.include_router(module.router)


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db", tags=["Health"])
def health_db(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok"}
