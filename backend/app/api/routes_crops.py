"""
AgriN — Crop Knowledge Catalogue API Routes
============================================
Provides query and filter endpoints for the 65+ expanded crops in the
AgriN Indian Agricultural Knowledge Catalogue.
"""

import os
import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
CATALOGUE_PATH = os.path.join(BASE_DIR, "knowledge", "india", "expanded_crop_catalogue.json")


def _load_catalogue() -> Dict[str, Any]:
    if not os.path.exists(CATALOGUE_PATH):
        raise HTTPException(status_code=500, detail="Crop catalogue not found. Run scripts/build_expanded_crop_catalogue.py")
    with open(CATALOGUE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/crops/catalogue", summary="Get expanded crop catalogue with multi-criteria filtering")
def get_crop_catalogue(
    category: Optional[str] = Query(None, description="Crop category e.g. cereal, pulse, fruit, oilseed, vegetable, spice"),
    season: Optional[str] = Query(None, description="Season e.g. kharif, rabi, zaid, perennial"),
    state: Optional[str] = Query(None, description="Indian state name"),
    soil_type: Optional[str] = Query(None, description="Soil type e.g. black, alluvial, red_loam"),
    search: Optional[str] = Query(None, description="Search by English, Hindi, or Marathi name"),
    lifecycle: Optional[str] = Query(None, description="seasonal or perennial")
):
    catalogue = _load_catalogue()
    crops = catalogue.get("crops", [])

    filtered = []
    for c in crops:
        if category and c.get("category", "").lower() != category.lower():
            continue
        if season and (season.lower() not in [s.lower() for s in c.get("growing_seasons", [])]):
            continue
        if state and (state.lower() not in [st.lower() for st in c.get("regional_suitability", [])]):
            continue
        if soil_type and (soil_type.lower() not in [s.lower() for s in c.get("soil_types", [])]):
            continue
        if lifecycle and c.get("lifecycle", "").lower() != lifecycle.lower():
            continue
        if search:
            q = search.lower()
            name_en = c.get("crop_name", "").lower()
            name_sci = c.get("scientific_name", "").lower()
            name_hi = c.get("hindi_name", "").lower()
            name_mr = c.get("marathi_name", "").lower()
            if q not in name_en and q not in name_sci and q not in name_hi and q not in name_mr:
                continue

        filtered.append(c)

    return {
        "metadata": catalogue.get("metadata", {}),
        "total_results": len(filtered),
        "crops": filtered
    }


@router.get("/crops/categories", summary="List supported crop categories")
def get_crop_categories():
    catalogue = _load_catalogue()
    categories = catalogue.get("metadata", {}).get("categories_supported", [])
    crops = catalogue.get("crops", [])

    category_counts = {}
    for c in crops:
        cat = c.get("category", "other")
        category_counts[cat] = category_counts.get(cat, 0) + 1

    return {
        "categories": categories,
        "counts": category_counts
    }


@router.get("/crops/{crop_id}", summary="Get detailed agronomic profile for a specific crop")
def get_crop_by_id(crop_id: str):
    catalogue = _load_catalogue()
    for c in catalogue.get("crops", []):
        if c.get("crop_id", "").lower() == crop_id.lower():
            return c
    raise HTTPException(status_code=404, detail=f"Crop with ID '{crop_id}' not found in catalogue")
