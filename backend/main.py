"""Venus Forex FastAPI application entry point."""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import auth, rates, cards, transactions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup."""
    Base.metadata.create_all(bind=engine)
    print("[OK] Database tables created / verified")
    yield
    print("Venus Forex API shutting down.")


app = FastAPI(
    title="Venus Forex API",
    description="Backend for Venus Forex — RBI Authorised Money Changer, Chennai",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(rates.router)
app.include_router(cards.router)
app.include_router(transactions.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "service": "Venus Forex API"}


@app.get("/", tags=["system"])
async def root():
    return {
        "name": "Venus Forex API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }
