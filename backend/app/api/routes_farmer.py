"""AgriN — Farm, Validation & Unified Analysis Routes"""

import logging
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.app.database.db import (
    get_db, FarmerSession, SoilRecord, EnvRecord, PredictionRecord
)
from backend.app.models.schemas import (
    AnalysisRequest, AnalysisResponse, ValidationResponse
)
from backend.app.services.validation import (
    validate_farm_inputs, validate_soil_inputs, validate_env_inputs,
    compute_data_confidence, count_missing_soil_fields
)
from backend.app.services.weather_service import fetch_live_weather
try:
    from backend.app.services.agrin_intelligence import run_full_agricultural_intelligence
except ImportError:
    from app.services.agrin_intelligence import run_full_agricultural_intelligence

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/weather")
def get_live_weather_for_district(
    district: str = "Parbhani",
    state: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None
):
    """Fetch real-time current weather parameters for a given location or coordinates."""
    return fetch_live_weather(district_name=district, state_name=state, lat=lat, lon=lon)



@router.post("/validate", response_model=ValidationResponse)
def validate_inputs(request: AnalysisRequest):
    """Validate all farmer inputs and return errors/warnings."""
    farm_v = validate_farm_inputs(request.farm_data.model_dump())
    soil_v = validate_soil_inputs(request.soil_data.model_dump())
    env_v = validate_env_inputs(request.env_data.model_dump())

    all_errors = farm_v.errors + soil_v.errors + env_v.errors
    all_warnings = farm_v.warnings + soil_v.warnings + env_v.warnings

    return ValidationResponse(
        is_valid=len(all_errors) == 0,
        errors=[e.to_dict() for e in all_errors],
        warnings=[w.to_dict() for w in all_warnings]
    )


@router.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest, db: Session = Depends(get_db)):
    """
    Primary Unified Agricultural Intelligence Pipeline (Phases 2 & 3).
    Synthesizes Location, Weather, Soil Health, Crop Suitability,
    Regenerative Opportunities, Farm Resilience, and Explainability.
    Maintains 100% backward compatibility for all legacy consumers.
    """
    session_id = request.session_id or str(uuid.uuid4())

    # Validate
    farm_v = validate_farm_inputs(request.farm_data.model_dump())
    soil_v = validate_soil_inputs(request.soil_data.model_dump())
    env_v = validate_env_inputs(request.env_data.model_dump())

    errors = farm_v.errors + soil_v.errors + env_v.errors
    if errors:
        raise HTTPException(
            status_code=422,
            detail={"message": "Validation failed", "errors": [e.to_dict() for e in errors]}
        )

    soil_dict = request.soil_data.model_dump()
    env_dict = request.env_data.model_dump()
    farm_dict = request.farm_data.model_dump()

    # Unified Agricultural Intelligence Orchestrator Execution
    full_payload = {
        **farm_dict,
        **soil_dict,
        **env_dict,
        "farm_id": session_id,
        "session_id": session_id
    }
    
    try:
        full_intel = run_full_agricultural_intelligence(full_payload)
    except Exception as intel_err:
        logger.error(
            "Unified agricultural intelligence orchestrator failed for session %s: %s",
            session_id, intel_err, exc_info=True
        )
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Unified agricultural intelligence pipeline failed",
                "session_id": session_id,
                "error": str(intel_err),
            }
        )

    pipeline_exec = full_intel.get("pipeline_execution", {}) if full_intel else {}
    subsystem_statuses = pipeline_exec.get("subsystem_statuses", {})
    if subsystem_statuses.get("soil") == "FAILED" or subsystem_statuses.get("crop_suitability") == "FAILED":
        logger.error(
            "Critical subsystem failure in unified pipeline %s (session %s): %s",
            pipeline_exec.get("pipeline_id"), session_id, pipeline_exec.get("errors")
        )
        raise HTTPException(
            status_code=503,
            detail={
                "message": "Critical agricultural intelligence subsystem unavailable",
                "session_id": session_id,
                "pipeline_execution": pipeline_exec,
            }
        )

    ranked_crops = full_intel.get("crop_suitability") or []
    from ml.predict import predictor
    m_info = {}
    feature_importance = []
    try:
        predictor.load()
        m_info = predictor.get_model_info() or {}
        feature_importance = predictor.get_feature_importance()
    except FileNotFoundError as model_err:
        logger.warning("ML model metadata unavailable during /api/analyze: %s", model_err)
    except Exception as model_err:
        logger.warning("Failed to load ML metadata during /api/analyze: %s", model_err)

    if m_info and m_info.get("metrics"):
        model_info = m_info
    else:
        model_info = {
            "model_type": m_info.get("model_type") if m_info else None,
            "model_version": m_info.get("model_version") if m_info else None,
            "training_date": m_info.get("training_date") if m_info else None,
            "n_classes": m_info.get("n_classes") if m_info else None,
            "metrics": None,
            "metrics_status": "UNAVAILABLE",
            "reason": "Trained model metadata or evaluation metrics could not be loaded from disk.",
        }

    n_missing, missing = count_missing_soil_fields(soil_dict)
    data_completeness = {
        "n_provided_soil": 12 - n_missing,
        "n_missing_soil": n_missing,
        "missing_soil_fields": missing,
        "completeness_pct": round(((12 - n_missing) / 12) * 100, 1),
        "confidence_level": compute_data_confidence(soil_dict, env_dict)
    }
    exp_obj = full_intel.get("explanation", {})
    explanation = exp_obj.get("what", "") + "\n\n" + "\n".join(exp_obj.get("why", []))

    # Persist to database
    try:
        # Farmer Session
        existing_sess = db.query(FarmerSession).filter(FarmerSession.session_id == session_id).first()
        if not existing_sess:
            farmer_sess = FarmerSession(
                session_id=session_id,
                country=farm_dict.get("country", "India"),
                state=farm_dict.get("state", "Maharashtra"),
                district=farm_dict.get("district"),
                sub_district=farm_dict.get("sub_district"),
                village=farm_dict.get("village"),
                latitude=farm_dict.get("latitude"),
                longitude=farm_dict.get("longitude"),
                agro_climatic_zone=farm_dict.get("agro_climatic_zone"),
                season=farm_dict.get("season"),
            )
            db.add(farmer_sess)
            db.commit()

        # Soil Record
        soil_rec = SoilRecord(
            session_id=session_id,
            N=soil_dict.get("N"), P=soil_dict.get("P"), K=soil_dict.get("K"),
            S=soil_dict.get("S"), Zn=soil_dict.get("Zn"), Fe=soil_dict.get("Fe"),
            Cu=soil_dict.get("Cu"), Mn=soil_dict.get("Mn"), B=soil_dict.get("B"),
            ph=soil_dict.get("ph"), EC=soil_dict.get("EC"), OC=soil_dict.get("OC"),
            soil_type=farm_dict.get("soil_type"),
        )
        db.add(soil_rec)

        # Env Record
        env_rec = EnvRecord(
            session_id=session_id,
            temperature=env_dict.get("temperature"),
            humidity=env_dict.get("humidity"),
            rainfall=env_dict.get("rainfall"),
        )
        db.add(env_rec)

        # Prediction Record
        top_crop = ranked_crops[0] if ranked_crops else {}
        pred_rec = PredictionRecord(
            session_id=session_id,
            model_version=model_info.get("model_version", "random_forest_v1"),
            top_crop=top_crop.get("crop", "Unknown"),
            top_score=top_crop.get("final_score", 0.0),
            ranked_crops_json=[c for c in ranked_crops],
            data_confidence=top_crop.get("data_confidence", "medium"),
        )
        db.add(pred_rec)
        db.commit()
    except Exception as db_err:
        db.rollback()
        # Log error silently so API response still succeeds
        print(f"Warning: Failed to persist analysis to DB: {db_err}")

    return AnalysisResponse(
        success=True,
        session_id=session_id,
        ranked_crops=ranked_crops,
        model_info=model_info,
        feature_importance=feature_importance,
        data_completeness=data_completeness,
        recommendation_explanation=explanation,
        # Unified AgriN Schema Fields (Phase 3)
        farm_context=full_intel.get("farm_context") if full_intel else None,
        location_context=full_intel.get("location_context") if full_intel else None,
        weather_context=full_intel.get("weather_context") if full_intel else None,
        soil_health=full_intel.get("soil_health") if full_intel else None,
        crop_suitability=ranked_crops,
        regenerative_opportunities=full_intel.get("regenerative_opportunities") if full_intel else None,
        farm_resilience=full_intel.get("farm_resilience") if full_intel else None,
        confidence=full_intel.get("confidence") if full_intel else None,
        explanation=full_intel.get("explanation") if full_intel else None,
        data_sources=full_intel.get("data_sources") if full_intel else None,
        limitations=full_intel.get("limitations") if full_intel else None,
        farm_intelligence_report=full_intel.get("farm_intelligence_report") if full_intel else None,
        risks=full_intel.get("risks") if full_intel else None,
        prioritized_advisories=full_intel.get("prioritized_advisories") if full_intel else None,
        data_quality=full_intel.get("data_quality") if full_intel else None,
        weather_reasoning=full_intel.get("weather_reasoning") if full_intel else None,
        country_neutral_advisory=full_intel.get("country_neutral_advisory") if full_intel else None,
        pipeline_execution=pipeline_exec,
        warnings=full_intel.get("warnings") if full_intel else None,
    )

