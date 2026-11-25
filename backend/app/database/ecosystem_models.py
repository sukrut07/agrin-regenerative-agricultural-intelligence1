"""
AgriN — Ecosystem Database Models
==================================
SQLAlchemy ORM tables for Soil Intelligence (Fingerprint, Stratified Depth,
Sampling Route Planner, Compaction, Treatment Outcome Tracker), AgriMarket
(Listings, Equipment Rentals, Buyer-Seller Enquiries), and Farm Economics (AgriLedger).
Designed to integrate seamlessly with Base from db.py.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Boolean, DateTime,
    Integer, Text, JSON, ForeignKey
)
from sqlalchemy.orm import relationship
from backend.app.database.db import Base


def _gen_uuid():
    return str(uuid.uuid4())


class FarmerProfile(Base):
    """User preferences, UI mode, and contact details."""
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(String(64), unique=True, index=True, default=_gen_uuid)
    display_name = Column(String(255), default="Kisan Bhai")
    phone = Column(String(32), nullable=True)
    state = Column(String(100), default="Maharashtra")
    district = Column(String(100), default="Parbhani")
    preferred_language = Column(String(10), default="mr")  # 'mr', 'hi', 'en'
    ui_mode = Column(String(20), default="simple")          # 'simple' | 'advanced'
    created_at = Column(DateTime, default=datetime.utcnow)


class SoilFingerprint(Base):
    """Comprehensive evolving field biometric profile across depth horizons."""
    __tablename__ = "soil_fingerprints"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    field_id = Column(String(64), index=True, nullable=False)
    farm_id = Column(String(64), index=True, nullable=False)
    depth_layer = Column(String(32), default="0-15cm")  # '0-15cm', '15-30cm', '30-60cm'
    
    # Primary Macronutrients
    n_val = Column(Float, nullable=True)
    p_val = Column(Float, nullable=True)
    k_val = Column(Float, nullable=True)
    
    # Secondary & Micronutrients
    s_val = Column(Float, nullable=True)
    zn_val = Column(Float, nullable=True)
    fe_val = Column(Float, nullable=True)
    cu_val = Column(Float, nullable=True)
    mn_val = Column(Float, nullable=True)
    b_val = Column(Float, nullable=True)
    
    # Physicochemical & Physical Soil Health
    ph = Column(Float, nullable=True)
    ec = Column(Float, nullable=True)
    oc = Column(Float, nullable=True)
    moisture_pct = Column(Float, nullable=True)
    compaction_psi = Column(Float, nullable=True)              # Soil penetrometer resistance
    infiltration_rate_mm_hr = Column(Float, nullable=True)     # Water infiltration rate
    soil_texture = Column(String(64), default="Medium Clay Loam")
    water_holding_capacity_pct = Column(Float, default=45.0)
    
    data_source = Column(String(64), default="LAB_REPORT")      # 'LAB_REPORT', 'CALIBRATED_SENSOR', 'LOCATION_ESTIMATE'
    confidence = Column(Float, default=0.95)
    measurement_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class SoilSamplingRoute(Base):
    """Field sampling route planner with representative zoned waypoints."""
    __tablename__ = "soil_sampling_routes"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    field_id = Column(String(64), index=True, nullable=False)
    farm_id = Column(String(64), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    num_zones = Column(Integer, default=5)
    target_depth_cm = Column(Integer, default=15)
    waypoints_json = Column(JSON, nullable=False)  # List of {id, lat, lon, label, zone, is_collected}
    sampling_instructions = Column(Text, nullable=True)
    status = Column(String(32), default="PLANNED")  # 'PLANNED', 'IN_PROGRESS', 'COMPLETED'
    created_at = Column(DateTime, default=datetime.utcnow)


class SoilTreatment(Base):
    """Historical soil interventions and before/after outcome tracking."""
    __tablename__ = "soil_treatments"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    field_id = Column(String(64), index=True, nullable=False)
    farm_id = Column(String(64), index=True, nullable=False)
    treatment_type = Column(String(64), nullable=False)  # 'COMPOST', 'GYPSUM', 'LIME', 'BIOFERTILIZER', 'COVER_CROP'
    amendment_name = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(32), default="kg")
    cost_inr = Column(Float, default=0.0)
    application_date = Column(DateTime, default=datetime.utcnow)
    
    # Before vs After Metrics
    pre_treatment_ph = Column(Float, nullable=True)
    pre_treatment_oc = Column(Float, nullable=True)
    post_treatment_ph = Column(Float, nullable=True)
    post_treatment_oc = Column(Float, nullable=True)
    outcome_rating = Column(String(32), default="PENDING")  # 'PENDING', 'SIGNIFICANT_IMPROVEMENT', 'MODERATE', 'NO_CHANGE'
    outcome_notes = Column(Text, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MarketplaceListing(Base):
    """Local agricultural commerce, produce sales, and machinery rentals."""
    __tablename__ = "marketplace_listings"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    seller_id = Column(String(64), index=True, nullable=False)
    seller_name = Column(String(255), nullable=False)
    seller_phone = Column(String(32), nullable=False)
    category = Column(String(64), index=True, nullable=False)  # 'PRODUCE', 'SEEDS', 'FERTILIZERS', 'SOIL_AMENDMENTS', 'EQUIPMENT_RENTAL', 'SERVICES'
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    pricing_unit = Column(String(32), default="per_kg")       # 'per_kg', 'per_quintal', 'per_day', 'per_hour'
    available_quantity = Column(Float, default=1.0)
    quantity_unit = Column(String(32), default="kg")
    location_district = Column(String(100), index=True, nullable=False)
    location_state = Column(String(100), default="Maharashtra")
    location_lat = Column(Float, nullable=True)
    location_lon = Column(Float, nullable=True)
    is_rental = Column(Boolean, default=False)
    deposit_required = Column(Float, default=0.0)
    is_verified_seller = Column(Boolean, default=True)
    status = Column(String(32), default="ACTIVE")             # 'ACTIVE', 'SOLD', 'PAUSED'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    enquiries = relationship("MarketplaceEnquiry", back_populates="listing", lazy="select", cascade="all, delete-orphan")


class MarketplaceEnquiry(Base):
    """Direct buyer-to-seller inquiry messages."""
    __tablename__ = "marketplace_enquiries"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    listing_id = Column(String(36), ForeignKey("marketplace_listings.id"), index=True, nullable=False)
    buyer_id = Column(String(64), index=True, nullable=False)
    buyer_name = Column(String(255), nullable=False)
    buyer_phone = Column(String(32), nullable=False)
    quantity_requested = Column(Float, nullable=True)
    proposed_price = Column(Float, nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(32), default="PENDING")  # 'PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    listing = relationship("MarketplaceListing", back_populates="enquiries")


class FarmExpense(Base):
    """AgriLedger — Field-wise cost of cultivation records."""
    __tablename__ = "farm_expenses"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    farm_id = Column(String(64), index=True, nullable=False)
    field_id = Column(String(64), index=True, nullable=True)
    category = Column(String(64), index=True, nullable=False)  # 'SEEDS', 'FERTILIZER', 'AMENDMENTS', 'MACHINERY_RENTAL', 'LABOR', 'IRRIGATION'
    description = Column(String(255), nullable=False)
    amount_inr = Column(Float, nullable=False)
    expense_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class FarmSale(Base):
    """AgriLedger — Farm harvest sales and revenue records."""
    __tablename__ = "farm_sales"

    id = Column(String(36), primary_key=True, default=_gen_uuid)
    farm_id = Column(String(64), index=True, nullable=False)
    field_id = Column(String(64), index=True, nullable=True)
    crop_name = Column(String(100), nullable=False)
    quantity_sold = Column(Float, nullable=False)
    unit = Column(String(32), default="quintals")
    rate_per_unit = Column(Float, nullable=False)
    total_revenue_inr = Column(Float, nullable=False)
    buyer_name = Column(String(255), nullable=True)
    sale_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
