#!/usr/bin/env python3
"""
AgriN — Synthetic Data Engine CLI Runner
========================================
CLI tool to generate reproducible synthetic agricultural datasets with
explicit provenance flags, anomaly scenarios, and data manifests.
"""

import os
import sys
import json
import csv
import argparse
from typing import List

# Ensure repository root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.insert(0, BASE_DIR)

from data.synthetic.scripts.synthetic_engine import SyntheticAgriculturalEngine


def main():
    parser = argparse.ArgumentParser(description="AgriN Synthetic Agricultural Data Generator")
    parser.add_argument("--seed", type=int, default=42, help="Deterministic random seed")
    parser.add_argument("--records", type=int, default=1000, help="Number of records to generate")
    parser.add_argument("--states", nargs="*", default=None, help="Filter to specific states")
    parser.add_argument("--output-dir", type=str, default=os.path.join(BASE_DIR, "data", "synthetic", "generated"), help="Output directory")
    parser.add_argument("--include-anomalies", action="store_true", default=True, help="Inject realistic anomalies")
    parser.add_argument("--format", choices=["json", "csv", "both"], default="both", help="Export format")

    args = parser.parse_args()

    os.makedirs(args.output_dir, exist_ok=True)
    print(f"🌾 Initializing Synthetic Engine with seed={args.seed}...")
    engine = SyntheticAgriculturalEngine(seed=args.seed)

    print(f"⚙️  Generating {args.records} agricultural records...")
    dataset = engine.generate_dataset(
        num_records=args.records,
        states=args.states,
        include_anomalies=args.include_anomalies
    )

    # 1. Save Full JSON
    if args.format in ["json", "both"]:
        json_path = os.path.join(args.output_dir, "synthetic_agricultural_dataset.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(dataset, f, indent=2, ensure_ascii=False)
        print(f"✅ Saved JSON dataset: {json_path}")

    # 2. Save Normalized CSVs
    if args.format in ["csv", "both"]:
        # Flat observations table for quick pandas / scikit-learn training tests
        flat_csv = os.path.join(args.output_dir, "crop_observations.csv")
        with open(flat_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "record_id", "is_synthetic", "state", "district", "zone",
                "farmer_name", "farm_id", "field_id", "soil_type",
                "crop_id", "crop_name", "variety", "season", "growth_stage", "estimated_yield_t_ha",
                "N", "P", "K", "S", "Zn", "Fe", "Cu", "Mn", "B", "ph", "EC", "OC",
                "temperature", "humidity", "rainfall", "soil_moisture",
                "device_id", "anomaly_scenario"
            ])
            for r in dataset:
                s = r["soil_parameters"]
                w = r["weather_parameters"]
                c = r["crop"]
                fm = r["farmer"]
                fd = r["field"]
                writer.writerow([
                    r["record_id"], r["is_synthetic"], fm["state"], fm["district"], fm["agro_climatic_zone"],
                    fm["farmer_name"], fd["farm_id"], fd["field_id"], fd["soil_type"],
                    c["crop_id"], c["crop_name"], c["variety"], c["season"], c["growth_stage"], c["estimated_yield_t_ha"],
                    s["N"], s["P"], s["K"], s["S"], s["Zn"], s["Fe"], s["Cu"], s["Mn"], s["B"], s["ph"], s["EC"], s["OC"],
                    w["temperature"], w["humidity"], w["rainfall"], w["soil_moisture"],
                    r["sensor_telemetry"]["device_id"], r["anomaly_scenario"]
                ])
        print(f"✅ Saved CSV dataset: {flat_csv}")

    # 3. Save Data Manifest
    anomaly_counts = {}
    state_counts = {}
    crop_counts = {}
    for r in dataset:
        ano = r["anomaly_scenario"]
        st = r["farmer"]["state"]
        cp = r["crop"]["crop_name"]
        anomaly_counts[ano] = anomaly_counts.get(ano, 0) + 1
        state_counts[st] = state_counts.get(st, 0) + 1
        crop_counts[cp] = crop_counts.get(cp, 0) + 1

    manifest = {
        "manifest_version": "2.1.0",
        "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "seed": args.seed,
        "total_records": len(dataset),
        "synthetic_flag": True,
        "data_provenance": "AgriN Synthetic Agricultural Engine (Faker + ICAR Agronomic Physics)",
        "intended_use": "Software UI Testing, Sensor Telemetry Simulation, Pipeline Stress Testing",
        "restricted_use": "DO NOT USE FOR FINAL ML MODEL EVALUATION OR ACCURACY CLAIMS",
        "anomaly_distribution": anomaly_counts,
        "state_coverage_count": len(state_counts),
        "crop_coverage_count": len(crop_counts),
        "files_generated": [
            "synthetic_agricultural_dataset.json",
            "crop_observations.csv",
            "data_manifest.json"
        ]
    }
    manifest_path = os.path.join(args.output_dir, "data_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"✅ Saved Data Manifest: {manifest_path}")


if __name__ == "__main__":
    import datetime
    main()
