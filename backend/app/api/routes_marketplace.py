"""
AgriN — AgriMarket API Endpoints
================================
Local agricultural marketplace connecting farmers with buyers, input dealers,
equipment rentals (tractors, tillers, harvesters), and soil amendment suppliers.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.app.database.db import get_db
from backend.app.database.ecosystem_models import (
    MarketplaceListing, MarketplaceEnquiry
)
from backend.app.models.ecosystem_schemas import (
    MarketplaceListingCreate, MarketplaceListingResponse,
    MarketplaceEnquiryCreate, MarketplaceEnquiryResponse
)

router = APIRouter(prefix="/marketplace", tags=["AgriMarket"])

# Indicative Agmarknet / APMC Mandi Modal Price Benchmarks (INR per Quintal / Unit)
MANDI_PRICE_BENCHMARKS = [
    {"commodity": "Soybean (सोयाबीन)", "mandi": "Latur APMC", "state": "Maharashtra", "modal_price": 4650, "unit": "per_quintal", "trend": "+₹50"},
    {"commodity": "Cotton (कपास - मध्यम स्टेपल)", "mandi": "Parbhani APMC", "state": "Maharashtra", "modal_price": 7250, "unit": "per_quintal", "trend": "+₹120"},
    {"commodity": "Chickpea / Chana (चना)", "mandi": "Akola APMC", "state": "Maharashtra", "modal_price": 5850, "unit": "per_quintal", "trend": "-₹30"},
    {"commodity": "Paddy / Basmati (धान)", "mandi": "Karnal APMC", "state": "Haryana", "modal_price": 3850, "unit": "per_quintal", "trend": "+₹80"},
    {"commodity": "Wheat (गेहूं)", "mandi": "Indore APMC", "state": "Madhya Pradesh", "modal_price": 2600, "unit": "per_quintal", "trend": "0"},
    {"commodity": "Mustard (सरसों)", "mandi": "Jaipur APMC", "state": "Rajasthan", "modal_price": 5400, "unit": "per_quintal", "trend": "+₹65"},
    {"commodity": "Tractor 45HP Rental", "mandi": "Local Average", "state": "All India", "modal_price": 750, "unit": "per_hour", "trend": "Stable"},
    {"commodity": "Rotavator Attachment", "mandi": "Local Average", "state": "All India", "modal_price": 450, "unit": "per_hour", "trend": "Stable"},
]

# Baseline seeded marketplace listings
SEED_LISTINGS = [
    {
        "seller_id": "seller_01",
        "seller_name": "Rameshwar Deshmukh",
        "seller_phone": "+91 98234 11223",
        "category": "EQUIPMENT_RENTAL",
        "title": "Mahindra 575 DI Tractor (45 HP) with Rotavator",
        "description": "Available for plowing, harrowing, and rotavator operations. Includes skilled driver. Diesel on actuals.",
        "price": 800.0,
        "pricing_unit": "per_hour",
        "available_quantity": 1.0,
        "quantity_unit": "units",
        "location_district": "Parbhani",
        "location_state": "Maharashtra",
        "is_rental": True,
        "deposit_required": 1000.0,
        "is_verified_seller": True
    },
    {
        "seller_id": "seller_02",
        "seller_name": "Krishi Vikas Agro Center",
        "seller_phone": "+91 98221 44556",
        "category": "SOIL_AMENDMENTS",
        "title": "Natural Gypsum (CaSO4·2H2O) 85% Purity (50kg Bag)",
        "description": "Certified agricultural grade gypsum for alkaline/sodic soil reclamation and sulfur enrichment.",
        "price": 240.0,
        "pricing_unit": "per_bag",
        "available_quantity": 250.0,
        "quantity_unit": "bags",
        "location_district": "Parbhani",
        "location_state": "Maharashtra",
        "is_rental": False,
        "deposit_required": 0.0,
        "is_verified_seller": True
    },
    {
        "seller_id": "seller_03",
        "seller_name": "Godavari Bio-Organic Producers",
        "seller_phone": "+91 94220 99887",
        "category": "FERTILIZERS",
        "title": "Well-Decomposed Vermicompost (Enriched with Trichoderma)",
        "description": "Laboratory tested vermicompost with 1.8% Nitrogen, 1.2% Phosphorus, and rich mycorrhizal spores.",
        "price": 7500.0,
        "pricing_unit": "per_tonne",
        "available_quantity": 15.0,
        "quantity_unit": "tonnes",
        "location_district": "Nanded",
        "location_state": "Maharashtra",
        "is_rental": False,
        "deposit_required": 0.0,
        "is_verified_seller": True
    },
    {
        "seller_id": "seller_04",
        "seller_name": "Sanjay Shinde",
        "seller_phone": "+91 97654 33221",
        "category": "SEEDS",
        "title": "Daincha (Sesbania) Green Manure Certified Seeds",
        "description": "High germination (92%) green manure seeds. Sown @ 25 kg/ha to fix biological nitrogen and rebuild organic carbon.",
        "price": 65.0,
        "pricing_unit": "per_kg",
        "available_quantity": 400.0,
        "quantity_unit": "kg",
        "location_district": "Parbhani",
        "location_state": "Maharashtra",
        "is_rental": False,
        "deposit_required": 0.0,
        "is_verified_seller": True
    },
    {
        "seller_id": "seller_05",
        "seller_name": "Marathwada Drone Spraying Services",
        "seller_phone": "+91 98900 77665",
        "category": "SERVICES",
        "title": "Precision Agricultural Drone Spraying (Foliar Nutrition / Biocontrol)",
        "description": "10-liter hexacopter drone covers 1 acre in 7 minutes with ultra-low volume uniform droplet coverage.",
        "price": 450.0,
        "pricing_unit": "per_acre",
        "available_quantity": 20.0,
        "quantity_unit": "acres_day",
        "location_district": "Parbhani",
        "location_state": "Maharashtra",
        "is_rental": False,
        "deposit_required": 0.0,
        "is_verified_seller": True
    },
    {
        "seller_id": "seller_06",
        "seller_name": "Gajanan Patil",
        "seller_phone": "+91 94211 88776",
        "category": "PRODUCE",
        "title": "Premium Bold Desi Chickpea (चना - विजय व्हरायटी)",
        "description": "Harvested last month, moisture 9.8%, clean sorted grain ready for delivery or mandi pickup.",
        "price": 5900.0,
        "pricing_unit": "per_quintal",
        "available_quantity": 45.0,
        "quantity_unit": "quintal",
        "location_district": "Hingoli",
        "location_state": "Maharashtra",
        "is_rental": False,
        "deposit_required": 0.0,
        "is_verified_seller": True
    }
]


def _ensure_seed_listings(db: Session):
    count = db.query(MarketplaceListing).count()
    if count == 0:
        for item in SEED_LISTINGS:
            db.add(MarketplaceListing(**item))
        db.commit()


# ── Listing Management Endpoints ──────────────────────────────────────────────

@router.get("/listings", response_model=List[MarketplaceListingResponse])
def get_listings(
    category: Optional[str] = None,
    district: Optional[str] = None,
    is_rental: Optional[bool] = None,
    search: Optional[str] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Retrieve marketplace listings filtered by category, district, and rental status."""
    _ensure_seed_listings(db)
    query = db.query(MarketplaceListing).filter(MarketplaceListing.status == "ACTIVE")

    if category and category.upper() != "ALL":
        query = query.filter(MarketplaceListing.category == category.upper())
    if district and district.lower() != "all":
        query = query.filter(MarketplaceListing.location_district.ilike(f"%{district}%"))
    if is_rental is not None:
        query = query.filter(MarketplaceListing.is_rental == is_rental)
    if max_price:
        query = query.filter(MarketplaceListing.price <= max_price)
    if search:
        s = f"%{search.lower()}%"
        query = query.filter(
            MarketplaceListing.title.ilike(s) | MarketplaceListing.description.ilike(s)
        )

    return query.order_by(MarketplaceListing.created_at.desc()).all()


@router.post("/listings", response_model=MarketplaceListingResponse)
def create_listing(
    payload: MarketplaceListingCreate,
    db: Session = Depends(get_db)
):
    """Publish a new agricultural product or equipment rental listing."""
    listing = MarketplaceListing(
        seller_id=payload.seller_id,
        seller_name=payload.seller_name,
        seller_phone=payload.seller_phone,
        category=payload.category.upper(),
        title=payload.title,
        description=payload.description,
        price=payload.price,
        pricing_unit=payload.pricing_unit,
        available_quantity=payload.available_quantity,
        quantity_unit=payload.quantity_unit,
        location_district=payload.location_district,
        location_state=payload.location_state,
        location_lat=payload.location_lat,
        location_lon=payload.location_lon,
        is_rental=payload.is_rental,
        deposit_required=payload.deposit_required or 0.0,
        is_verified_seller=True,
        status="ACTIVE"
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing


@router.get("/listings/{listing_id}", response_model=MarketplaceListingResponse)
def get_listing_detail(
    listing_id: str,
    db: Session = Depends(get_db)
):
    """Retrieve full details of a single marketplace listing."""
    listing = db.query(MarketplaceListing).filter(MarketplaceListing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


# ── Buyer-Seller Inquiries ───────────────────────────────────────────────────

@router.post("/enquiries", response_model=MarketplaceEnquiryResponse)
def submit_enquiry(
    payload: MarketplaceEnquiryCreate,
    db: Session = Depends(get_db)
):
    """Send an enquiry or price proposal to the seller for a listing."""
    listing = db.query(MarketplaceListing).filter(MarketplaceListing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Target listing does not exist")

    enquiry = MarketplaceEnquiry(
        listing_id=payload.listing_id,
        buyer_id=payload.buyer_id,
        buyer_name=payload.buyer_name,
        buyer_phone=payload.buyer_phone,
        quantity_requested=payload.quantity_requested,
        proposed_price=payload.proposed_price,
        message=payload.message,
        status="PENDING"
    )
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry


@router.get("/enquiries/listing/{listing_id}", response_model=List[MarketplaceEnquiryResponse])
def get_listing_enquiries(
    listing_id: str,
    db: Session = Depends(get_db)
):
    """Get all buyer inquiries received for a specific listing."""
    return db.query(MarketplaceEnquiry).filter(MarketplaceEnquiry.listing_id == listing_id).all()


# ── Price Intelligence & Soil-to-Market Connection ───────────────────────────

@router.get("/price-benchmarks")
def get_price_benchmarks():
    """Retrieve indicative Agmarknet mandi modal prices for comparative market intelligence."""
    return {
        "source": "Agmarknet APMC Daily Modal Prices",
        "last_updated": datetime.utcnow().strftime("%Y-%m-%d"),
        "benchmarks": MANDI_PRICE_BENCHMARKS
    }


@router.get("/soil-amendments-match", response_model=List[MarketplaceListingResponse])
def get_amendments_matching_deficiency(
    deficiency: str = Query(..., description="e.g. 'ph_high', 'low_oc', 'zinc_deficit', 'nitrogen_deficit'"),
    district: Optional[str] = "Parbhani",
    db: Session = Depends(get_db)
):
    """
    Soil-to-Market Bridge: Returns marketplace products that remediate a diagnosed soil issue.
    """
    _ensure_seed_listings(db)
    query = db.query(MarketplaceListing).filter(MarketplaceListing.status == "ACTIVE")

    if deficiency in ("ph_high", "alkaline", "sodic"):
        # Match Gypsum or sulfur amendments
        query = query.filter((MarketplaceListing.title.ilike("%gypsum%")) | (MarketplaceListing.category == "SOIL_AMENDMENTS"))
    elif deficiency in ("low_oc", "organic_carbon"):
        # Match vermicompost or green manure seeds
        query = query.filter(
            (MarketplaceListing.title.ilike("%vermicompost%")) |
            (MarketplaceListing.title.ilike("%daincha%")) |
            (MarketplaceListing.category == "FERTILIZERS")
        )
    elif deficiency in ("zinc_deficit", "micronutrient"):
        query = query.filter(MarketplaceListing.category == "SOIL_AMENDMENTS")
    else:
        query = query.filter(MarketplaceListing.category.in_(["SOIL_AMENDMENTS", "FERTILIZERS", "SEEDS"]))

    return query.all()
