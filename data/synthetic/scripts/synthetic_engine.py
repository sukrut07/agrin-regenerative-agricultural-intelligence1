"""
AgriN — Synthetic Agricultural Data Engine
===========================================
Generates realistic, scientifically constrained agricultural datasets
combining Python Faker (for identity/administrative metadata) with ICAR-derived
soil-climate physics and crop physiology models.

All records carry `is_synthetic = True`, institutional provenance flags,
deterministic generation seeds, and audit metadata.
"""

import os
import json
import uuid
import random
import datetime
from typing import List, Dict, Any, Optional

try:
    from faker import Faker
except ImportError:
    Faker = None

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
KNOWLEDGE_DIR = os.path.join(BASE_DIR, "knowledge")
PROFILES_DIR = os.path.join(BASE_DIR, "data", "synthetic", "profiles")


class SyntheticAgriculturalEngine:
    def __init__(self, seed: int = 42, locale: str = "en_IN"):
        self.seed = seed
        self.rng = random.Random(seed)
        if Faker:
            self.faker = Faker(locale)
            self.faker.seed_instance(seed)
        else:
            self.faker = None

        self._load_knowledge_bases()

    def _load_knowledge_bases(self):
        # 1. States and districts
        states_path = os.path.join(KNOWLEDGE_DIR, "india", "states_and_districts.json")
        with open(states_path, "r", encoding="utf-8") as f:
            self.states_data = json.load(f)

        # 2. Expanded crop catalogue
        crop_path = os.path.join(KNOWLEDGE_DIR, "india", "expanded_crop_catalogue.json")
        with open(crop_path, "r", encoding="utf-8") as f:
            catalog = json.load(f)
            self.crops_list = catalog.get("crops", [])

        # 3. Soil profiles
        soil_path = os.path.join(PROFILES_DIR, "soil_profiles.json")
        with open(soil_path, "r", encoding="utf-8") as f:
            self.soil_profiles = json.load(f).get("profiles", {})

        # 4. Seasonal profiles
        season_path = os.path.join(PROFILES_DIR, "seasonal_profiles.json")
        with open(season_path, "r", encoding="utf-8") as f:
            self.season_profiles = json.load(f).get("seasons", {})

    def _get_district_info(self, state_name: Optional[str] = None) -> Dict[str, Any]:
        states_dict = self.states_data.get("states", {})
        if state_name and state_name in states_dict:
            target_state = state_name
        else:
            target_state = self.rng.choice(list(states_dict.keys()))

        st_obj = states_dict[target_state]
        districts = st_obj.get("districts", [])
        if not districts:
            return {
                "state": target_state,
                "district": "Capital",
                "lat": 20.0,
                "lon": 78.0,
                "zone": "Central Plateau and Hills",
                "annual_rainfall": 900,
                "default_temp": 26.0,
                "default_humidity": 65.0
            }

        dist = self.rng.choice(districts)
        return {
            "state": target_state,
            "district": dist["name"],
            "district_id": dist["id"],
            "lat": dist["lat"],
            "lon": dist["lon"],
            "zone": dist["zone"],
            "annual_rainfall": dist.get("annual_rainfall", 850),
            "default_temp": dist.get("default_temp", 26.5),
            "default_humidity": dist.get("default_humidity", 65.0)
        }

    def _select_compatible_crop(self, state: str, season: str) -> Dict[str, Any]:
        candidates = []
        for c in self.crops_list:
            seasons = c.get("growing_seasons", [])
            suit_states = c.get("regional_suitability", [])
            season_match = (season in seasons) or ("perennial" in seasons)
            state_match = (state in suit_states) or (len(suit_states) > 5)
            if season_match and state_match:
                candidates.append(c)

        if not candidates:
            for c in self.crops_list:
                if (season in c.get("growing_seasons", [])) or ("perennial" in c.get("growing_seasons", [])):
                    candidates.append(c)

        return self.rng.choice(candidates) if candidates else self.crops_list[0]

    def _generate_soil_measurements(self, soil_type: str) -> Dict[str, float]:
        profile = self.soil_profiles.get(soil_type, self.soil_profiles.get("black", {}))
        ranges = profile.get("typical_ranges", {})

        def sample(key, d_min, d_max, decimals=1):
            r = ranges.get(key, [d_min, d_max])
            val = self.rng.uniform(r[0], r[1])
            return round(val, decimals)

        return {
            "N": sample("N", 60, 200, 1),
            "P": sample("P", 10, 45, 1),
            "K": sample("K", 120, 350, 1),
            "S": sample("S", 8.0, 25.0, 2),
            "Zn": sample("Zn", 0.3, 1.5, 2),
            "Fe": sample("Fe", 4.0, 18.0, 2),
            "Cu": sample("Cu", 0.2, 1.2, 2),
            "Mn": sample("Mn", 2.5, 12.0, 2),
            "B": sample("B", 0.3, 1.2, 2),
            "ph": sample("ph", 6.2, 8.2, 2),
            "EC": sample("EC", 0.15, 0.95, 2),
            "OC": sample("OC", 0.35, 1.10, 3)
        }

    def _generate_weather(self, dist_info: Dict[str, Any], season: str) -> Dict[str, float]:
        s_prof = self.season_profiles.get(season, self.season_profiles.get("kharif"))
        rain_frac_range = s_prof.get("rainfall_fraction_of_annual", [0.5, 0.8])
        annual_rain = dist_info.get("annual_rainfall", 800)
        frac = self.rng.uniform(rain_frac_range[0], rain_frac_range[1])
        season_rain = round(annual_rain * frac, 1)

        base_temp = dist_info.get("default_temp", 26.0)
        temp_shift = s_prof.get("temp_modulation_c", 0.0)
        temp_jitter = self.rng.uniform(-2.5, 2.5)
        temperature = round(base_temp + temp_shift + temp_jitter, 1)

        hum_range = s_prof.get("relative_humidity_range", [50.0, 80.0])
        humidity = round(self.rng.uniform(hum_range[0], hum_range[1]), 1)

        moist_range = s_prof.get("soil_moisture_range", [35.0, 75.0])
        soil_moisture = round(self.rng.uniform(moist_range[0], moist_range[1]), 1)

        return {
            "temperature": temperature,
            "humidity": humidity,
            "rainfall": season_rain,
            "soil_moisture": soil_moisture
        }

    def generate_single_record(
        self,
        state_name: Optional[str] = None,
        season: Optional[str] = None,
        soil_type: Optional[str] = None,
        anomaly_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a single scientifically valid or specifically anomalous agricultural record."""
        dist = self._get_district_info(state_name)
        chosen_season = season if season else self.rng.choice(["kharif", "rabi", "zaid"])
        chosen_soil = soil_type if soil_type else self.rng.choice(list(self.soil_profiles.keys()))

        crop = self._select_compatible_crop(dist["state"], chosen_season)
        variety = self.rng.choice(crop.get("varieties", ["Improved Local"]))

        soil_vals = self._generate_soil_measurements(chosen_soil)
        weather_vals = self._generate_weather(dist, chosen_season)

        # Farmer identity using Faker
        if self.faker:
            farmer_name = f"{self.faker.first_name()} {self.faker.last_name()}"
            village_name = f"{self.faker.city_prefix() if hasattr(self.faker, 'city_prefix') else 'Rampur'} Village"
            phone = f"+91-{self.rng.randint(70000, 99999)}{self.rng.randint(10000, 99999)}"
        else:
            first_names = ["Ramesh", "Suresh", "Ganesh", "Santosh", "Vijay", "Anil", "Pravin", "Sunil", "Sunita", "Rekha"]
            last_names = ["Patil", "Deshmukh", "Pawar", "Shinde", "Jadhav", "Kale", "Kulkarni", "Sharma", "Yadav", "Singh"]
            farmer_name = f"{self.rng.choice(first_names)} {self.rng.choice(last_names)}"
            village_name = f"Gram {self.rng.choice(['Bori', 'Shivapur', 'Khadki', 'Chincholi', 'Dharur'])}"
            phone = f"+91-98{self.rng.randint(10000000, 99999999)}"

        farm_uuid = str(uuid.uuid4())
        field_id = f"FLD-{self.rng.randint(100, 999)}"

        duration = crop.get("duration_days", {}).get("typical", 110)
        sow_day_offset = self.rng.randint(20, 150)
        today = datetime.date(2026, 11, 24)
        sow_date = today - datetime.timedelta(days=sow_day_offset)

        # Growth stages based on days elapsed
        days_elapsed = (today - sow_date).days
        if days_elapsed < 20:
            stage = "Emergence / Seedling"
        elif days_elapsed < 50:
            stage = "Vegetative Growth"
        elif days_elapsed < 85:
            stage = "Flowering / Pod Formation"
        elif days_elapsed < duration:
            stage = "Grain / Fruit Maturity"
        else:
            stage = "Harvest Ready"

        expected_yield = self.rng.uniform(1.5, 4.5)  # t/ha

        record = {
            "record_id": f"AGRIN-SYN-{uuid.uuid4().hex[:10].upper()}",
            "is_synthetic": True,
            "synthetic_profile_version": "2.1.0",
            "generation_seed": self.seed,
            "provenance": {
                "source_type": "SYNTHETIC_AGRONOMIC_SIMULATION",
                "institution_baseline": "ICAR-DES Open Statistics Hierarchy",
                "label": "SYNTHETIC_DATA — NOT FOR CLINICAL EVALUATION"
            },
            "farmer": {
                "farmer_name": farmer_name,
                "contact_phone": phone,
                "village": village_name,
                "district": dist["district"],
                "state": dist["state"],
                "country": "India",
                "coordinates": {"lat": dist["lat"], "lon": dist["lon"]},
                "agro_climatic_zone": dist["zone"]
            },
            "field": {
                "farm_id": farm_uuid,
                "field_id": field_id,
                "area_hectares": round(self.rng.uniform(0.8, 6.5), 2),
                "soil_type": chosen_soil,
                "irrigation_type": self.rng.choice(["drip", "sprinkler", "flood", "rainfed"]),
                "drainage_condition": self.rng.choice(["good", "moderate", "poor"])
            },
            "crop": {
                "crop_id": crop["crop_id"],
                "crop_name": crop["crop_name"],
                "scientific_name": crop["scientific_name"],
                "category": crop["category"],
                "lifecycle": crop["lifecycle"],
                "variety": variety,
                "season": chosen_season,
                "sowing_date": sow_date.isoformat(),
                "growth_stage": stage,
                "days_after_sowing": days_elapsed,
                "estimated_yield_t_ha": round(expected_yield, 2)
            },
            "soil_parameters": soil_vals,
            "weather_parameters": weather_vals,
            "sensor_telemetry": {
                "device_id": f"agrisense-sim-{self.rng.randint(100, 999)}",
                "soil_moisture_pct": weather_vals["soil_moisture"],
                "soil_temperature_c": round(weather_vals["temperature"] - 1.2, 1),
                "soil_ph": soil_vals["ph"],
                "soil_ec_ds_m": soil_vals["EC"],
                "estimated_n_kg_ha": int(soil_vals["N"]),
                "estimated_p_kg_ha": int(soil_vals["P"]),
                "estimated_k_kg_ha": int(soil_vals["K"]),
                "data_source": "SIMULATED_WOKWI_ESP32",
                "telemetry_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
            },
            "anomaly_scenario": anomaly_type or "NORMAL"
        }

        # Apply anomaly if requested
        if anomaly_type == "DROUGHT":
            record["weather_parameters"]["rainfall"] = round(record["weather_parameters"]["rainfall"] * 0.15, 1)
            record["weather_parameters"]["soil_moisture"] = round(self.rng.uniform(8.0, 18.0), 1)
            record["sensor_telemetry"]["soil_moisture_pct"] = record["weather_parameters"]["soil_moisture"]
            record["field"]["irrigation_type"] = "rainfed"
        elif anomaly_type == "WATERLOGGING":
            record["weather_parameters"]["rainfall"] = round(record["weather_parameters"]["rainfall"] * 2.2, 1)
            record["weather_parameters"]["soil_moisture"] = round(self.rng.uniform(88.0, 98.0), 1)
            record["sensor_telemetry"]["soil_moisture_pct"] = record["weather_parameters"]["soil_moisture"]
            record["field"]["drainage_condition"] = "poor"
        elif anomaly_type == "SALINITY_STRESS":
            record["soil_parameters"]["EC"] = round(self.rng.uniform(4.5, 9.8), 2)
            record["soil_parameters"]["ph"] = round(self.rng.uniform(8.8, 10.2), 2)
            record["sensor_telemetry"]["soil_ec_ds_m"] = record["soil_parameters"]["EC"]
            record["sensor_telemetry"]["soil_ph"] = record["soil_parameters"]["ph"]
        elif anomaly_type == "NUTRIENT_DEFICIENCY":
            record["soil_parameters"]["N"] = round(self.rng.uniform(25.0, 50.0), 1)
            record["soil_parameters"]["P"] = round(self.rng.uniform(3.0, 8.0), 1)
            record["soil_parameters"]["Zn"] = round(self.rng.uniform(0.1, 0.3), 2)
        elif anomaly_type == "HEAT_STRESS":
            record["weather_parameters"]["temperature"] = round(self.rng.uniform(41.0, 46.5), 1)
            record["weather_parameters"]["humidity"] = round(self.rng.uniform(15.0, 25.0), 1)
        elif anomaly_type == "SENSOR_DRIFT":
            record["sensor_telemetry"]["soil_ph"] = 12.8  # Uncalibrated drift
            record["sensor_telemetry"]["quality"] = "DEGRADED"
        elif anomaly_type == "SENSOR_STUCK":
            record["sensor_telemetry"]["soil_moisture_pct"] = 99.9  # Shorted probe
            record["sensor_telemetry"]["quality"] = "INVALID"

        return record

    def generate_dataset(
        self,
        num_records: int = 1000,
        states: Optional[List[str]] = None,
        include_anomalies: bool = True
    ) -> List[Dict[str, Any]]:
        """Generate balanced multi-state dataset."""
        dataset = []
        anomaly_pool = [
            "DROUGHT", "WATERLOGGING", "SALINITY_STRESS",
            "NUTRIENT_DEFICIENCY", "HEAT_STRESS", "SENSOR_DRIFT", "SENSOR_STUCK"
        ]

        for i in range(num_records):
            state = self.rng.choice(states) if states else None
            anomaly = None
            if include_anomalies and i % 15 == 0:
                anomaly = self.rng.choice(anomaly_pool)

            rec = self.generate_single_record(state_name=state, anomaly_type=anomaly)
            dataset.append(rec)

        return dataset
