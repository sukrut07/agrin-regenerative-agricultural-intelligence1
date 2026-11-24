"""
AgriN — AgriLedger (Farm Economics) API Endpoints
=================================================
Cost of cultivation tracking, field-wise expenses (seeds, fertilizer, machinery, labor),
harvest revenue records, and net seasonal P&L calculations.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database.db import get_db
from backend.app.database.ecosystem_models import FarmExpense, FarmSale
from backend.app.models.ecosystem_schemas import (
    FarmExpenseCreate, FarmExpenseResponse,
    FarmSaleCreate, FarmSaleResponse,
    FarmPnLSummary
)

router = APIRouter(prefix="/economics", tags=["Farm Economics (AgriLedger)"])

SEED_EXPENSES = [
    {"farm_id": "farm_default", "category": "SEEDS", "description": "Certified Soybean JS-335 (3 bags @ ₹2,400)", "amount_inr": 7200.0},
    {"farm_id": "farm_default", "category": "AMENDMENTS", "description": "Agricultural Gypsum 10 bags for alkalinity", "amount_inr": 2400.0},
    {"farm_id": "farm_default", "category": "MACHINERY_RENTAL", "description": "Tractor plowing & rotavator (6 hours @ ₹800/hr)", "amount_inr": 4800.0},
    {"farm_id": "farm_default", "category": "LABOR", "description": "Sowing & weeding labor (8 person-days)", "amount_inr": 3600.0},
    {"farm_id": "farm_default", "category": "FERTILIZER", "description": "Biofertilizer PSB + Rhizobium culture packets", "amount_inr": 650.0},
]

SEED_SALES = [
    {"farm_id": "farm_default", "crop_name": "Soybean (सोयाबीन)", "quantity_sold": 28.0, "unit": "quintals", "rate_per_unit": 4650.0, "total_revenue_inr": 130200.0, "buyer_name": "Parbhani APMC Mandi"}
]


def _ensure_seed_economics(db: Session, farm_id: str):
    count = db.query(FarmExpense).filter(FarmExpense.farm_id == farm_id).count()
    if count == 0:
        for exp in SEED_EXPENSES:
            db.add(FarmExpense(**exp))
        for sale in SEED_SALES:
            db.add(FarmSale(**sale))
        db.commit()


@router.get("/expenses/{farm_id}", response_model=List[FarmExpenseResponse])
def get_farm_expenses(farm_id: str, db: Session = Depends(get_db)):
    """Retrieve all expenses incurred for a farm."""
    _ensure_seed_economics(db, farm_id)
    return db.query(FarmExpense).filter(FarmExpense.farm_id == farm_id).order_by(FarmExpense.expense_date.desc()).all()


@router.post("/expenses", response_model=FarmExpenseResponse)
def add_farm_expense(payload: FarmExpenseCreate, db: Session = Depends(get_db)):
    """Add a new farm expenditure record."""
    expense = FarmExpense(
        farm_id=payload.farm_id,
        field_id=payload.field_id,
        category=payload.category.upper(),
        description=payload.description,
        amount_inr=payload.amount_inr,
        expense_date=payload.expense_date or datetime.utcnow()
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("/sales/{farm_id}", response_model=List[FarmSaleResponse])
def get_farm_sales(farm_id: str, db: Session = Depends(get_db)):
    """Retrieve all harvest sales recorded for a farm."""
    _ensure_seed_economics(db, farm_id)
    return db.query(FarmSale).filter(FarmSale.farm_id == farm_id).order_by(FarmSale.sale_date.desc()).all()


@router.post("/sales", response_model=FarmSaleResponse)
def record_farm_sale(payload: FarmSaleCreate, db: Session = Depends(get_db)):
    """Record a harvest commodity sale."""
    sale = FarmSale(
        farm_id=payload.farm_id,
        field_id=payload.field_id,
        crop_name=payload.crop_name,
        quantity_sold=payload.quantity_sold,
        unit=payload.unit,
        rate_per_unit=payload.rate_per_unit,
        total_revenue_inr=payload.total_revenue_inr,
        buyer_name=payload.buyer_name,
        sale_date=payload.sale_date or datetime.utcnow()
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


@router.get("/pnl/{farm_id}", response_model=FarmPnLSummary)
def get_farm_pnl(farm_id: str, db: Session = Depends(get_db)):
    """Compute overall farm profit & loss, expense categories, and margins."""
    _ensure_seed_economics(db, farm_id)
    expenses = db.query(FarmExpense).filter(FarmExpense.farm_id == farm_id).all()
    sales = db.query(FarmSale).filter(FarmSale.farm_id == farm_id).all()

    total_exp = sum(e.amount_inr for e in expenses)
    total_rev = sum(s.total_revenue_inr for s in sales)
    net_profit = total_rev - total_exp

    cat_breakdown = {}
    for e in expenses:
        cat_breakdown[e.category] = cat_breakdown.get(e.category, 0.0) + e.amount_inr

    margin = round((net_profit / total_rev * 100), 1) if total_rev > 0 else 0.0
    cost_per_ha = round(total_exp / 2.4, 2)  # Normalized to standard 2.4 ha plot

    return FarmPnLSummary(
        farm_id=farm_id,
        total_expenses_inr=total_exp,
        total_revenue_inr=total_rev,
        net_profit_inr=net_profit,
        cost_per_hectare_inr=cost_per_ha,
        profit_margin_pct=margin,
        expenses_by_category=cat_breakdown
    )
