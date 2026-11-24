"""
AgriN — Ecosystem Pydantic Schemas
==================================
Data validation and response schemas for Soil Intelligence, AgriMarket,
and Farm Economics.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# ── Farmer Profile & Preferences ──────────────────────────────────────────────

class FarmerProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    phone: Optional[str] = None
    state: Optional[str] = "Maharashtra"
    district: Optional[str] = "Parbhani"
    preferred_language: Optional[str] = "mr"  # 'mr', 'hi', 'en'
    ui_mode: Optional[str] = "simple"         # 'simple' | 'advanced'


class FarmerProfileResponse(BaseModel):
    user_id: str
    display_name: str
    phone: Optional[str] = None
    state: str
    district: str
    preferred_language: str
    ui_mode: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Soil Fingerprint & Depth Intelligence ─────────────────────────────────────

class SoilFingerprintCreate(BaseModel):
    field_id: str
    farm_id: str
    depth_layer: str = "0-15cm"  # '0-15cm', '15-30cm', '30-60cm'
    n_val: Optional[float] = None
    p_val: Optional[float] = None
    k_val: Optional[float] = None
    s_val: Optional[float] = None
    zn_val: Optional[float] = None
    fe_val: Optional[float] = None
    cu_val: Optional[float] = None
    mn_val: Optional[float] = None
    b_val: Optional[float] = None
    ph: Optional[float] = None
    ec: Optional[float] = None
    oc: Optional[float] = None
    moisture_pct: Optional[float] = None
    compaction_psi: Optional[float] = None
    infiltration_rate_mm_hr: Optional[float] = None
    soil_texture: Optional[str] = "Medium Clay Loam"
    water_holding_capacity_pct: Optional[float] = 45.0
    data_source: Optional[str] = "LAB_REPORT"


class SoilFingerprintResponse(SoilFingerprintCreate):
    id: str
    confidence: float
    measurement_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class SoilDepthLayerComparison(BaseModel):
    depth_layer: str
    n_val: Optional[float]
    p_val: Optional[float]
    k_val: Optional[float]
    ph: Optional[float]
    ec: Optional[float]
    oc: Optional[float]
    moisture_pct: Optional[float]
    compaction_psi: Optional[float]
    diagnosis: str


class SoilDepthAnalysisResponse(BaseModel):
    field_id: str
    farm_id: str
    layers: List[SoilDepthLayerComparison]
    root_zone_evaluation: str
    subsoil_constraints: List[str]
    hardpan_detected: bool


# ── Soil Sampling Route Planner ──────────────────────────────────────────────

class SamplingWaypoint(BaseModel):
    point_id: str
    lat: float
    lon: float
    label: str
    zone_name: str
    target_depth_cm: int = 15
    is_collected: bool = False


class SoilSamplingRouteCreate(BaseModel):
    field_id: str
    farm_id: str
    title: str = "Pre-Sowing Representative Soil Sampling"
    num_zones: int = 5
    target_depth_cm: int = 15
    center_lat: Optional[float] = 19.26
    center_lon: Optional[float] = 76.77
    sampling_instructions: Optional[str] = "Sample along 'W' path avoiding fence lines and irrigation trenches."


class SoilSamplingRouteResponse(BaseModel):
    id: str
    field_id: str
    farm_id: str
    title: str
    num_zones: int
    target_depth_cm: int
    waypoints_json: List[Dict[str, Any]]
    sampling_instructions: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Soil Treatment Outcome Tracker ───────────────────────────────────────────

class SoilTreatmentCreate(BaseModel):
    field_id: str
    farm_id: str
    treatment_type: str  # 'COMPOST', 'GYPSUM', 'LIME', 'BIOFERTILIZER', 'GREEN_MANURE'
    amendment_name: str
    quantity: float
    unit: str = "kg"
    cost_inr: float = 0.0
    application_date: Optional[datetime] = None
    pre_treatment_ph: Optional[float] = None
    pre_treatment_oc: Optional[float] = None
    outcome_notes: Optional[str] = None


class SoilTreatmentResponse(BaseModel):
    id: str
    field_id: str
    farm_id: str
    treatment_type: str
    amendment_name: str
    quantity: float
    unit: str
    cost_inr: float
    application_date: datetime
    pre_treatment_ph: Optional[float]
    pre_treatment_oc: Optional[float]
    post_treatment_ph: Optional[float]
    post_treatment_oc: Optional[float]
    outcome_rating: str
    outcome_notes: Optional[str]
    follow_up_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


# ── AgriMarket: Listings & Enquiries ─────────────────────────────────────────

class MarketplaceListingCreate(BaseModel):
    seller_id: str = "farmer_demo_1"
    seller_name: str = "Balasaheb Patil"
    seller_phone: str = "+91 98220 12345"
    category: str  # 'PRODUCE', 'SEEDS', 'FERTILIZERS', 'SOIL_AMENDMENTS', 'EQUIPMENT_RENTAL', 'SERVICES'
    title: str
    description: Optional[str] = None
    price: float
    pricing_unit: str = "per_quintal"
    available_quantity: float = 10.0
    quantity_unit: str = "quintal"
    location_district: str = "Parbhani"
    location_state: str = "Maharashtra"
    location_lat: Optional[float] = 19.2608
    location_lon: Optional[float] = 76.7748
    is_rental: bool = False
    deposit_required: Optional[float] = 0.0


class MarketplaceListingResponse(MarketplaceListingCreate):
    id: str
    is_verified_seller: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class MarketplaceEnquiryCreate(BaseModel):
    listing_id: str
    buyer_id: str = "farmer_buyer_2"
    buyer_name: str = "Suresh Jadhav"
    buyer_phone: str = "+91 98221 54321"
    quantity_requested: Optional[float] = 5.0
    proposed_price: Optional[float] = None
    message: str


class MarketplaceEnquiryResponse(MarketplaceEnquiryCreate):
    id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── AgriLedger: Farm Economics ───────────────────────────────────────────────

class FarmExpenseCreate(BaseModel):
    farm_id: str
    field_id: Optional[str] = None
    category: str  # 'SEEDS', 'FERTILIZER', 'AMENDMENTS', 'MACHINERY_RENTAL', 'LABOR', 'IRRIGATION'
    description: str
    amount_inr: float
    expense_date: Optional[datetime] = None


class FarmExpenseResponse(FarmExpenseCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class FarmSaleCreate(BaseModel):
    farm_id: str
    field_id: Optional[str] = None
    crop_name: str
    quantity_sold: float
    unit: str = "quintals"
    rate_per_unit: float
    total_revenue_inr: float
    buyer_name: Optional[str] = "APMC Mandi"
    sale_date: Optional[datetime] = None


class FarmSaleResponse(FarmSaleCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class FarmPnLSummary(BaseModel):
    farm_id: str
    total_expenses_inr: float
    total_revenue_inr: float
    net_profit_inr: float
    cost_per_hectare_inr: float
    profit_margin_pct: float
    expenses_by_category: Dict[str, float]
